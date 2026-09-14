# Business modules

Real product modules go here — one folder per module, each with its own
`*.module.ts`, controller, service, repository, and `dto/`, registered in
`../app.module.ts`. `deals/` is the reference implementation: controller
handles HTTP only, service holds use-case logic, repository holds the
Kysely queries. Follow that split for new modules rather than collapsing
everything into one file.
