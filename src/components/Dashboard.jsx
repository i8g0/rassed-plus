import AdvisorDashboard from './AdvisorDashboard';
import { useLanguage } from '../contexts/LanguageProvider';

// Unified dashboard entrypoint that applies identity/wording across advisor UI.
export default function Dashboard(props) {
  const { language } = useLanguage();
  
  const RASSED_BEACON_IDENTITY = {
    name: language === 'en' ? 'Rased Beacon' : 'منارة راصد',
    competencyTitle: language === 'en' ? 'Rased Beacon Competency Board' : 'لوحة جدارة منارة راصد',
    automationTitle: language === 'en' ? 'Rased Beacon Automation Panel' : 'لوحة تحكم منارة راصد',
    commandLabel: language === 'en' ? 'Rased Beacon Command: Execute Solutions' : 'أمر من منارة راصد: نفذ الحلول',
  };

  return <AdvisorDashboard {...props} identity={RASSED_BEACON_IDENTITY} />;
}
