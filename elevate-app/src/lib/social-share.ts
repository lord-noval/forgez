// Social sharing utilities

export type SocialPlatform = 'discord' | 'reddit' | 'facebook' | 'whatsapp' | 'twitter' | 'linkedin' | 'copy';

export interface ShareData {
  title: string;
  description?: string;
  url: string;
  hashtags?: string[];
}

// Platform-specific URL generators
export const socialShareUrls: Record<SocialPlatform, (data: ShareData) => string> = {
  discord: (data) => {
    // Discord doesn't have a direct share URL, but we can format text for copying
    return `https://discord.com/channels/@me?text=${encodeURIComponent(`${data.title}\n${data.description || ''}\n${data.url}`)}`;
  },

  reddit: (data) => {
    return `https://reddit.com/submit?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}`;
  },

  facebook: (data) => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title)}`;
  },

  whatsapp: (data) => {
    const text = `${data.title}${data.description ? '\n' + data.description : ''}\n${data.url}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  },

  twitter: (data) => {
    const hashtags = data.hashtags?.join(',') || '';
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}${hashtags ? `&hashtags=${hashtags}` : ''}`;
  },

  linkedin: (data) => {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
  },

  copy: (data) => {
    return data.url;
  },
};

// Get share URL for a platform
export function getShareUrl(platform: SocialPlatform, data: ShareData): string {
  return socialShareUrls[platform](data);
}

// Open share dialog for a platform
export function openShareWindow(platform: SocialPlatform, data: ShareData): void {
  if (platform === 'copy') {
    copyToClipboard(data.url);
    return;
  }

  const url = getShareUrl(platform, data);
  const width = 600;
  const height = 400;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  window.open(
    url,
    'share-dialog',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Platform display info
export interface PlatformInfo {
  name: string;
  color: string;
  icon: string;
}

export const platformInfo: Record<SocialPlatform, PlatformInfo> = {
  discord: { name: 'Discord', color: '#5865F2', icon: 'discord' },
  reddit: { name: 'Reddit', color: '#FF4500', icon: 'reddit' },
  facebook: { name: 'Facebook', color: '#1877F2', icon: 'facebook' },
  whatsapp: { name: 'WhatsApp', color: '#25D366', icon: 'whatsapp' },
  twitter: { name: 'X (Twitter)', color: '#000000', icon: 'twitter' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', icon: 'linkedin' },
  copy: { name: 'Copy Link', color: '#6B7280', icon: 'copy' },
};

// Generate project share data
export function createProjectShareData(project: {
  id: string;
  title: string;
  description?: string;
}): ShareData {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return {
    title: `Check out my project: ${project.title}`,
    description: project.description,
    url: `${baseUrl}/portfolio/${project.id}`,
    hashtags: ['FORGEZ', 'Portfolio', 'Skills'],
  };
}
