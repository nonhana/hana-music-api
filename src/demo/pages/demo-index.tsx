/** @jsxImportSource hono/jsx */

import type { FC } from 'hono/jsx'

import type { DemoGroupDefinition, DemoPageDefinition } from '../registry.ts'

import { DemoCard } from '../components/demo-shell.tsx'

interface DemoIndexPageProps {
  readonly groups: Array<{
    readonly group: DemoGroupDefinition
    readonly pages: DemoPageDefinition[]
  }>
}

export const DemoIndexPage: FC<DemoIndexPageProps> = ({ groups }) => {
  return (
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
  )
}
