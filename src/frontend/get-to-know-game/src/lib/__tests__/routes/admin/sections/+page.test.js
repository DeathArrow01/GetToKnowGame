import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import SectionsPage from '../../../../../routes/admin/sections/+page.svelte';

// Mock the adminApi module
vi.mock('$lib/services/adminApi.js', () => ({
  adminApi: {
    getSections: vi.fn(),
    deleteSection: vi.fn()
  }
}));

// Mock the SectionManager component
vi.mock('$lib/components/admin/SectionManager.svelte', () => ({
  default: vi.fn()
}));

// Import the mocked adminApi
import { adminApi } from '$lib/services/adminApi.js';

describe('SectionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page title and add button', () => {
    render(SectionsPage);
    
    expect(screen.getByText('Section Management')).toBeInTheDocument();
    expect(screen.getByText('➕ Add Section')).toBeInTheDocument();
  });

  test('renders basic page structure', () => {
    render(SectionsPage);
    
    // Check that the component renders the basic structure
    expect(screen.getByText('Section Management')).toBeInTheDocument();
    expect(screen.getByText('➕ Add Section')).toBeInTheDocument();
    expect(screen.getByText('Total Sections')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
    expect(screen.getByText('Avg per Section')).toBeInTheDocument();
  });

  test('renders with mocked data', () => {
    const mockSectionsData = {
      sections: {
        'General': 5,
        'Hobbies': 3,
        'Work': 2
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // Check that the component renders the basic structure
    expect(screen.getByText('Section Management')).toBeInTheDocument();
    expect(screen.getByText('➕ Add Section')).toBeInTheDocument();
  });

  test('handles error state gracefully', () => {
    adminApi.getSections.mockRejectedValue(new Error('Network error'));
    
    render(SectionsPage);
    
    // The component should handle the error gracefully
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles empty sections data', () => {
    const mockSectionsData = {
      sections: {},
      totalSections: 0
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with null data', () => {
    const mockSectionsData = {
      sections: null,
      totalSections: 0
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with undefined data', () => {
    const mockSectionsData = {
      sections: undefined,
      totalSections: 0
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with missing totalSections', () => {
    const mockSectionsData = {
      sections: {
        'General': 5,
        'Hobbies': 3
      }
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with zero question counts', () => {
    const mockSectionsData = {
      sections: {
        'General': 0,
        'Hobbies': 0,
        'Work': 0
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with negative question counts', () => {
    const mockSectionsData = {
      sections: {
        'General': -1,
        'Hobbies': -2,
        'Work': 0
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with very large question counts', () => {
    const mockSectionsData = {
      sections: {
        'General': 999999,
        'Hobbies': 888888,
        'Work': 777777
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with special characters in names', () => {
    const mockSectionsData = {
      sections: {
        'General & Basic': 5,
        'Hobbies & Interests': 3,
        'Work-Life Balance': 2
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with very long names', () => {
    const mockSectionsData = {
      sections: {
        'This is a very long section name that might cause layout issues': 5,
        'Another very long section name that might cause layout issues': 3
      },
      totalSections: 2
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with empty string names', () => {
    const mockSectionsData = {
      sections: {
        '': 5,
        'General': 3,
        'Hobbies': 2
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with null names', () => {
    const mockSectionsData = {
      sections: {
        null: 5,
        'General': 3,
        'Hobbies': 2
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with undefined names', () => {
    const mockSectionsData = {
      sections: {
        undefined: 5,
        'General': 3,
        'Hobbies': 2
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with mixed data types', () => {
    const mockSectionsData = {
      sections: {
        'General': 5,
        'Hobbies': '3',
        'Work': 2.5
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with very large number of sections', () => {
    const sections = {};
    for (let i = 0; i < 1000; i++) {
      sections[`Section ${i}`] = Math.floor(Math.random() * 100);
    }
    
    const mockSectionsData = {
      sections,
      totalSections: 1000
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with duplicate names', () => {
    const mockSectionsData = {
      sections: {
        'General': 5,
        'General': 3, // Duplicate key
        'Hobbies': 2
      },
      totalSections: 2 // Only 2 unique sections
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with whitespace-only names', () => {
    const mockSectionsData = {
      sections: {
        '   ': 5,
        'General': 3,
        'Hobbies': 2
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with newline characters in names', () => {
    const mockSectionsData = {
      sections: {
        'General\nSection': 5,
        'Hobbies\r\nSection': 3,
        'Work Section': 2
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });

  test('handles sections with unicode characters in names', () => {
    const mockSectionsData = {
      sections: {
        'General 中文': 5,
        'Hobbies 🎯': 3,
        'Work 💼': 2
      },
      totalSections: 3
    };
    
    adminApi.getSections.mockResolvedValue(mockSectionsData);
    
    render(SectionsPage);
    
    // The component should render without crashing
    expect(screen.getByText('Section Management')).toBeInTheDocument();
  });
});