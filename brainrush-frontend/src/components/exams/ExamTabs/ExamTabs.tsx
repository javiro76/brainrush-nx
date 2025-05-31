import {
  Box,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import { ExamTabsProps } from '../../../types/exams';

/**
 * Componente de pestañas para categorizar exámenes
 * @param tabs - Lista de pestañas disponibles
 * @param currentTab - Índice de la pestaña activa
 * @param exams - Lista completa de exámenes para contar badges
 * @param onTabChange - Función para cambiar de pestaña
 */
const ExamTabs = ({
  tabs,
  currentTab,
  exams,
  onTabChange
}: ExamTabsProps) => {

  const getTabLabel = (tab: typeof tabs[0], index: number) => {
    if (tab.label === 'Todos') {
      return tab.label;
    }

    const count = exams.filter(exam => exam.type === tab.value).length;
    return (
      <Badge
        badgeContent={count}
        color="primary"
      >
        {tab.label}
      </Badge>
    );
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={currentTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={getTabLabel(tab, index)}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default ExamTabs;
