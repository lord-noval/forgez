-- Migration: 360-Degree Feedback System
-- Date: 2026-01-31
-- Creates tables for feedback requests, respondents, and responses

-- =====================================================
-- PART 1: CREATE ENUM TYPES (if not exist)
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN
        CREATE TYPE feedback_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'DECLINED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_type') THEN
        CREATE TYPE feedback_type AS ENUM ('VOICE', 'TEXT', 'VIDEO');
    END IF;
END $$;

-- =====================================================
-- PART 2: CREATE FEEDBACK TABLES
-- =====================================================

-- Feedback requests table
CREATE TABLE IF NOT EXISTS public.feedback_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    context TEXT,
    prompt_questions JSONB NOT NULL DEFAULT '{"questions": []}',
    status feedback_status DEFAULT 'PENDING',
    expires_at TIMESTAMPTZ NOT NULL,
    min_respondents INTEGER DEFAULT 3,
    max_respondents INTEGER DEFAULT 10,
    is_anonymous BOOLEAN DEFAULT true,
    aggregated_results JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Feedback respondents table (invited peers with access tokens)
CREATE TABLE IF NOT EXISTS public.feedback_respondents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.feedback_requests(id) ON DELETE CASCADE,
    respondent_email TEXT NOT NULL,
    respondent_name TEXT,
    respondent_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    access_token TEXT UNIQUE NOT NULL,
    relationship TEXT,
    status feedback_status DEFAULT 'PENDING',
    invited_at TIMESTAMPTZ DEFAULT now(),
    responded_at TIMESTAMPTZ,

    UNIQUE(request_id, respondent_email)
);

-- Feedback responses table (voice/text/video responses)
CREATE TABLE IF NOT EXISTS public.feedback_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    respondent_id UUID NOT NULL REFERENCES public.feedback_respondents(id) ON DELETE CASCADE,
    feedback_type feedback_type NOT NULL,
    content TEXT,
    audio_url TEXT,
    video_url TEXT,
    transcription TEXT,
    sentiment_analysis JSONB,
    skill_indicators JSONB,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PART 3: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_feedback_requests_user_id ON public.feedback_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_requests_status ON public.feedback_requests(status);
CREATE INDEX IF NOT EXISTS idx_feedback_requests_expires_at ON public.feedback_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_feedback_respondents_request_id ON public.feedback_respondents(request_id);
CREATE INDEX IF NOT EXISTS idx_feedback_respondents_access_token ON public.feedback_respondents(access_token);
CREATE INDEX IF NOT EXISTS idx_feedback_respondents_email ON public.feedback_respondents(respondent_email);
CREATE INDEX IF NOT EXISTS idx_feedback_respondents_status ON public.feedback_respondents(status);

CREATE INDEX IF NOT EXISTS idx_feedback_responses_respondent_id ON public.feedback_responses(respondent_id);

-- =====================================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_respondents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 5: RLS POLICIES FOR FEEDBACK_REQUESTS
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own feedback requests" ON public.feedback_requests;
DROP POLICY IF EXISTS "Users can create own feedback requests" ON public.feedback_requests;
DROP POLICY IF EXISTS "Users can update own feedback requests" ON public.feedback_requests;
DROP POLICY IF EXISTS "Users can delete own feedback requests" ON public.feedback_requests;

-- Owners can view their own requests
CREATE POLICY "Users can view own feedback requests"
    ON public.feedback_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Owners can create requests
CREATE POLICY "Users can create own feedback requests"
    ON public.feedback_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Owners can update their requests
CREATE POLICY "Users can update own feedback requests"
    ON public.feedback_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Owners can delete their requests
CREATE POLICY "Users can delete own feedback requests"
    ON public.feedback_requests FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PART 6: RLS POLICIES FOR FEEDBACK_RESPONDENTS
-- =====================================================

DROP POLICY IF EXISTS "Request owners can view respondents" ON public.feedback_respondents;
DROP POLICY IF EXISTS "Request owners can create respondents" ON public.feedback_respondents;
DROP POLICY IF EXISTS "Request owners can update respondents" ON public.feedback_respondents;
DROP POLICY IF EXISTS "Request owners can delete respondents" ON public.feedback_respondents;
DROP POLICY IF EXISTS "Service role can access all respondents" ON public.feedback_respondents;

-- Request owners can view their respondents
CREATE POLICY "Request owners can view respondents"
    ON public.feedback_respondents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.feedback_requests
            WHERE id = feedback_respondents.request_id
            AND user_id = auth.uid()
        )
    );

-- Request owners can create respondents
CREATE POLICY "Request owners can create respondents"
    ON public.feedback_respondents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.feedback_requests
            WHERE id = feedback_respondents.request_id
            AND user_id = auth.uid()
        )
    );

-- Request owners can update respondents
CREATE POLICY "Request owners can update respondents"
    ON public.feedback_respondents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.feedback_requests
            WHERE id = feedback_respondents.request_id
            AND user_id = auth.uid()
        )
    );

-- Request owners can delete respondents
CREATE POLICY "Request owners can delete respondents"
    ON public.feedback_respondents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.feedback_requests
            WHERE id = feedback_respondents.request_id
            AND user_id = auth.uid()
        )
    );

-- =====================================================
-- PART 7: RLS POLICIES FOR FEEDBACK_RESPONSES
-- =====================================================

DROP POLICY IF EXISTS "Request owners can view responses" ON public.feedback_responses;
DROP POLICY IF EXISTS "Request owners can create responses" ON public.feedback_responses;

-- Request owners can view responses to their requests
CREATE POLICY "Request owners can view responses"
    ON public.feedback_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.feedback_respondents fr
            JOIN public.feedback_requests req ON req.id = fr.request_id
            WHERE fr.id = feedback_responses.respondent_id
            AND req.user_id = auth.uid()
        )
    );

-- Note: Responses are created via service role / API with token validation
-- No direct INSERT policy for authenticated users since respondents use tokens

-- =====================================================
-- PART 8: CREATE STORAGE BUCKET FOR RECORDINGS
-- =====================================================

-- Note: Storage bucket creation should be done via Supabase dashboard or API
-- The bucket 'feedback-recordings' should already exist per CLAUDE.md

-- =====================================================
-- PART 9: FUNCTION TO UPDATE REQUEST STATUS
-- =====================================================

CREATE OR REPLACE FUNCTION update_feedback_request_status()
RETURNS TRIGGER AS $$
DECLARE
    total_respondents INTEGER;
    completed_respondents INTEGER;
    min_required INTEGER;
BEGIN
    -- Count respondents for this request
    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE status = 'COMPLETED'),
           fr.min_respondents
    INTO total_respondents, completed_respondents, min_required
    FROM public.feedback_respondents resp
    JOIN public.feedback_requests fr ON fr.id = resp.request_id
    WHERE resp.request_id = NEW.request_id
    GROUP BY fr.min_respondents;

    -- Update request status if minimum respondents completed
    IF completed_respondents >= min_required THEN
        UPDATE public.feedback_requests
        SET status = 'COMPLETED',
            completed_at = NOW()
        WHERE id = NEW.request_id
        AND status != 'COMPLETED';
    ELSIF completed_respondents > 0 THEN
        UPDATE public.feedback_requests
        SET status = 'IN_PROGRESS'
        WHERE id = NEW.request_id
        AND status = 'PENDING';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update request status when respondent status changes
DROP TRIGGER IF EXISTS on_respondent_status_change ON public.feedback_respondents;
CREATE TRIGGER on_respondent_status_change
    AFTER UPDATE OF status ON public.feedback_respondents
    FOR EACH ROW
    WHEN (NEW.status = 'COMPLETED')
    EXECUTE FUNCTION update_feedback_request_status();

-- =====================================================
-- Migration complete!
-- =====================================================
