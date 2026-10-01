import type { FC } from 'hono/jsx';

import { DemoCard } from '../components/demo-shell.tsx';
import type { DemoGroupDefinition, DemoPageDefinition } from '../registry.ts';

interface DemoIndexPageProps {
  readonly groups: Array<{
    readonly group: DemoGroupDefinition;
    readonly pages: Array<DemoPageDefinition>;
  }>;
}

export const DemoIndexPage: FC<DemoIndexPageProps> = ({ groups }) => (
  <>
    {groups.map(({ group, pages }) => (
      <section class="group-section">
        <div class="group-heading">
          <h2>{group.title}</h2>
          <p>{group.description}</p>
        </div>
        <div class="card-grid">
          {pages
            .filter((page) => page.path !== '/demo')
            .map((page) => (
              <DemoCard page={page} />
            ))}
        </div>
      </section>
    ))}
  </>
);
