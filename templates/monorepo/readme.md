# monorepo template

## To init, run

```bash
npm run init
```

## Bug

'yarn add' and 'yarn workspace component add' will install all the dependencies of every workspaces.
Therefore, 'yarn workspace focus' should be rerun to remove useless dependencies.