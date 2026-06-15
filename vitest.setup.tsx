import React from "react";
import "@testing-library/jest-dom";

// Mock lucide-react icons
vi.mock("lucide-react", () => {
  const icons = {
    Film: () => <span data-testid="icon-film" />,
    Users: () => <span data-testid="icon-users" />,
    Zap: () => <span data-testid="icon-zap" />,
    Trophy: () => <span data-testid="icon-trophy" />,
    Sparkles: () => <span data-testid="icon-sparkles" />,
    Shield: () => <span data-testid="icon-shield" />,
    ArrowRight: () => <span data-testid="icon-arrow-right" />,
    Settings: () => <span data-testid="icon-settings" />,
    History: () => <span data-testid="icon-history" />,
    Plus: () => <span data-testid="icon-plus" />,
    BarChart2: () => <span data-testid="icon-bar-chart" />,
  };
  return icons;
});

// Make React available globally for JSX transform
global.React = React;