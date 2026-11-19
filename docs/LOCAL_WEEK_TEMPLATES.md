# Local week templates

The Guru page loads weekly question workbooks from `src/data-eval/` and bundles them with the Vite app. No server, cloud storage, or external file listing is required.

Use these filenames for additional weeks:

- `week-1.xlsx`
- `week-2.xlsx`
- `week-3.xlsx`
- `week-4.xlsx`

`minggu-<number>.xlsx` and `week_<number>.xlsx` are also recognized. The existing `template_feedback_guru.xlsx` is used as the Week 1 workbook unless `week-1.xlsx` is added; the explicitly named weekly workbook takes precedence.

Each workbook must use the existing Feedback Excel format. Weeks without a matching workbook appear disabled in the selector. Add the file to `src/data-eval/` and rebuild/redeploy to make it available.

Teacher scores and selections remain in browser `localStorage`. Teachers can export their annotated workbook or use the JSON backup and restore controls to move data between devices.
