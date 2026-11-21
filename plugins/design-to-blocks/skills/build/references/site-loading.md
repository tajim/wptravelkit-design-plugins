# Loading pages onto the site

`load-page.mjs` creates the page (as a draft) or updates the page with the same slug, and sets the "Block Canvas" template (`page-templates/template-block-canvas.php`). It prints the page id and link; save the id in project.json.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/load-page.mjs" --file .d2b/out/<slug>.txt --slug <slug> --title "<Title>" [--status publish]
```

## WP-CLI (`site.method: "wpcli"`)

Needs the `wp` command with a database connection. On Local (Flywheel), the simplest way is to start Claude Code from Local's "Open site shell" (right-click the site > Open site shell, then `cd` to the project folder and run `claude`): that shell has Local's php, mysql socket and wp-cli. Test with `wp --path="<site.path>" option get siteurl`.

## REST (`site.method: "rest"`)

Needs an application password: WordPress admin > Users > Profile > Application Passwords. The user sets these in the shell BEFORE starting Claude Code (never paste the password into the chat, never write it into project.json):
```bash
export D2B_WP_USER="admin"
export D2B_WP_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
```
WordPress only offers application passwords over HTTPS or when the site's environment type is "local" (Local sets this). If the menu is missing, use WP-CLI or manual.

## Manual (`site.method: "manual"`)

Give the user the .txt file and say: create a page, choose the "Block Canvas" template, open the Code editor (Options > Code editor), paste everything, switch back to the visual editor, save.

## After loading

- Give the user the edit link (`<url>/wp-admin/post.php?post=<id>&action=edit`) and the page link.
- If the page shows "This block contains unexpected or invalid content" anywhere, that is a bug in the page script: find the block, fix the script, re-run check.sh, reload. Never ask the user to "attempt block recovery".
