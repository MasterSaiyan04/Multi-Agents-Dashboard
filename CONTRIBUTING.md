# Contributing

Thanks for helping improve Multi-Agents Dashboard. Small documentation fixes, reproducible bug reports, and focused code changes are welcome.

## Start locally

1. Fork the repository and create a branch for your change.
2. Follow the prerequisites and installation steps in [README.md](README.md).
3. Use the fixture demo and a disposable workspace for development. Never commit API keys, `.env`, personal workspace contents, SQLite databases, or generated audio.
4. Check [existing issues](https://github.com/MasterSaiyan04/Multi-Agents-Dashboard/issues) before opening a new one. Discuss substantial architectural changes in an issue first.

## Report bugs or propose features

For bugs, include the commit or version, operating system, Node.js version, steps to reproduce, expected behavior, actual behavior, and sanitized logs. State whether fixture or live workspace data was used. For features, explain the user problem, a concrete use case, and how success can be checked. Do not attach private workspace files or credentials.

## Validate a change

```bash
npm run lint
npm run build
npm run start
```

Open `http://localhost:8787` and verify the affected view or workflow. Check `/api/mission/summary` for a JSON response. For file editing, use a disposable file and verify both saving and reloading. For standups, use voice disabled and confirm that transcript and artifacts appear. Report what you tested and what remains untested.

There is currently no automated behavioral test suite; TypeScript checks alone do not prove runtime behavior. Add focused regression coverage when fixing behavior once suitable test infrastructure exists.

## Pull requests

- Keep each PR focused and explain the problem, the change, and validation performed.
- Link the relevant issue, if any. Include screenshots for visible UI changes, using sanitized demo data.
- Update documentation when configuration or behavior changes.
- Preserve existing content and avoid unrelated formatting or dependency changes.
- Changes to public types should keep `src/`, `server/`, and `shared/mission.ts` consistent.
- Distinguish simulated data from measured runtime results in code and documentation.

Submit only contributions you have the right to share under the repository's [MIT License](LICENSE). Respect third-party notices and licenses. Maintainers review PRs before merging; a PR does not imply a release commitment.
