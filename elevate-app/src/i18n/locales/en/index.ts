// English translations index
// Combines all domain-specific translation files

import common from './common.json';
import auth from './auth.json';
import dashboard from './dashboard.json';
import portfolio from './portfolio.json';
import skills from './skills.json';
import feedback from './feedback.json';
import teams from './teams.json';
import careers from './careers.json';
import learn from './learn.json';
import onboarding from './onboarding.json';
import errors from './errors.json';
import settings from './settings.json';
import profile from './profile.json';
import compass from './compass.json';
import quest from './quest.json';
import achievements from './achievements.json';

// World-specific translations
import forgez from './worlds/forgez.json';

const messages = {
  common,
  auth,
  dashboard,
  portfolio,
  skills,
  feedback,
  teams,
  careers,
  learn,
  onboarding,
  errors,
  settings,
  profile,
  compass,
  quest,
  achievements,
  worlds: {
    forgez,
  },
} as const;

export default messages;
