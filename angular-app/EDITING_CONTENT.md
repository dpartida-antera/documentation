# Editing the guide text (no coding)

The written text on the two guide pages (intros, section paragraphs, and the highlighted callouts) is editable content. You do **not** need to touch code to change it.

What is editable: the page intro, each section's lead paragraph, and the colored note/info callouts.

What is **not** editable here (a developer handles these): the page structure, the tables, the flowcharts, the interactive tools, and the QA scenarios. Those come from the rules engine on purpose so they stay correct.

The text lives in two files:

- `src/content/shipping-guide.json`
- `src/content/auto-allocation-guide.json`

You can edit it in either of two ways.

## Option A: the friendly editor (Decap CMS)

There is a form-based editor at the `/admin/` URL of the app. You pick a guide, edit the fields (with a normal rich-text style toolbar), and save.

**To try it locally on your machine:**

1. Open a terminal in the `angular-app` folder and run `npx decap-server` (leave it running).
2. In a second terminal run `npm start`.
3. Open `http://localhost:4200/admin/`.

With this local mode, saving writes straight to the JSON files.

**For real editors (shared, with a login):** a developer sets the GitHub repository and a login provider once in `public/admin/config.yml` (the `backend` section). After that, editors just visit `/admin/`, log in, edit, and save. Saving makes a commit, the site rebuilds, and the new text appears.

## Option B: edit the file directly on GitHub

If you are comfortable on GitHub: open `src/content/shipping-guide.json` (or the auto-allocation one), click the pencil to edit, change the text inside the quotes, and commit. The site rebuilds and updates.

## Formatting (Markdown)

The text supports light Markdown:

- `**bold**` shows as **bold**
- `_italic_` shows as _italic_
- `[label](https://example.com)` makes a link

Keep each field to a sentence or short paragraph. Headings, bullet lists, and tables are part of the page layout, not the editable text.

## How changes go live

Edits are saved to the project's files and committed to git. When the site is rebuilt and deployed (automatically, if continuous deployment is set up), the new text shows. No code change is needed for wording edits.

If you need to change something that is not in these files (a table, a flowchart, a scenario, the structure), ask a developer; that is a code change.
