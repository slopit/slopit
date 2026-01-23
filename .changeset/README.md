# Changesets

This folder is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a Changeset

When you make changes that should be released:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the semver bump type (major/minor/patch)
3. Write a summary of the changes

## Releasing

The release process is automated via GitHub Actions. When changesets are merged to `main`, a "Version Packages" PR is automatically created. Merging that PR triggers the npm publish.
