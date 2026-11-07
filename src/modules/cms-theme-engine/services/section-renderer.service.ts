export interface ThemeBlock {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

export interface ThemeSection {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  blocks?: ThemeBlock[];
}

export interface ThemeTemplateLayout {
  name: string;
  sections: Record<string, ThemeSection>;
  order: string[];
}

export class SectionRendererService {
  renderLayout(layout: ThemeTemplateLayout): Array<{ sectionId: string; type: string; settings: Record<string, unknown>; blocks: ThemeBlock[] }> {
    return layout.order.map((sectionId) => {
      const section = layout.sections[sectionId];
      if (!section) {
        return {
          sectionId,
          type: 'empty',
          settings: {},
          blocks: [],
        };
      }
      return {
        sectionId,
        type: section.type,
        settings: section.settings || {},
        blocks: section.blocks || [],
      };
    });
  }
}

