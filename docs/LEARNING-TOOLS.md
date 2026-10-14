# Grade 9 Agriculture learning tools

Open the **Learning tools** tab for eight additions. Tools use the current offline learner profile and preserve the app's lesson, game, quiz, and textbook views.

| Tool | Use |
| --- | --- |
| Practical portfolio | Save a title, date, observations, results, and up to three JPG, PNG, or WebP photos for the current lesson. Photos are resized to 1,200 pixels and stored in IndexedDB. |
| Practise my mistakes | Revisit outstanding questions from quizzes and timed assessments, with an explanation for each answer. Correct responses remove questions from revision; a subsequent wrong quiz answer brings them back. |
| Scheduled flashcards | Reveal and rate cards in the original Flashcards tab or in Learning tools. Difficult cards return the next day. Easy cards start at three days and increase to a maximum of 60 days. Review dates persist per learner. |
| Practical marking | Teacher profiles assess submitted projects on planning, safety, method, evidence, and reflection, each out of three. Students and parents can read the results. |
| Garden experiments | Create experiments for different crops or treatments, record height, water, harvest, and observations, and compare growth charts and measurement tables. Export measurements as CSV. |
| Offline downloads | Inspect saved lessons, textbook figures, videos, and the included CPU AI model and runtimes. Save missing files with progress and cancellation, and check browser storage usage. |
| Farm budgeting | Enter simulated costs, yield, price, and an available budget. Calculate profit or loss, budget remaining, and break-even sales. Save and reopen plans. Prices are classroom assumptions. |
| Activity sheets | Preview and print A4 learning worksheets, practical project checklists, and garden observation sheets. Learning worksheets can include a separate teacher answer key. Use the browser's Save PDF option for a PDF. |

## Practical feedback across devices

1. The learner exports projects with photos from the Portfolio tool.
2. On the teacher's device, create or select a local student profile for that learner and import the project file.
3. Switch to a Teacher profile, select the learner under Practical marking, choose the lesson, and assess the project.
4. Export feedback. The learner imports that feedback file under Practical marking on their own device.

Project IDs connect feedback to the original evidence. Files do not create accounts or grant teacher access; assessment entry requires a Teacher profile. Profiles on one browser already share the records without file transfer.

## Backup and storage

**Export learning backup** includes projects and photos, experiments, review dates, budget plans, and a snapshot of course progress. Student profiles can import that file using **Import learning backup**. Imports merge records: existing project evidence and notes remain, and quiz scores and XP keep the higher value. Settings, account identity, and PINs are not transferred. The Portfolio import accepts project files and restores the learning-tool records from backup files; full course-progress merging uses the dedicated backup importer.

Written records are saved through the app's existing storage wrapper. Photos use IndexedDB; when photo storage is blocked, users can still submit written evidence. Limits are 500 projects, three photos per project, 100 experiments, 1,000 observations per experiment, and 100 saved budgets. Export old work before removing it. Clearing browser data removes local records and cached downloads.

Serve the app over HTTPS or localhost for service workers and managed downloads. `file://` can display the app but cannot provide managed offline installation. The existing HTML includes the CPU model; the download manager can store that included model for offline model-file requests. AI use still depends on the existing runtime and device compatibility. Download status distinguishes complete files from incomplete responses or Git LFS placeholders. Cancellation keeps files already saved. Browser storage may be evicted, so retain exported work separately.

## Validation

- `node --check scripts/learning-tools.js`
- `node --check scripts/app.js`
- `node --check sw.js`
- `node scripts/test-learning-tools.cjs`
- `node scripts/test-learning-tools-browser.cjs`

The browser tests use installed Chrome, a temporary isolated profile, a local static server, and Chrome's debugging protocol. Set `CHROME_PATH` if Chrome is installed elsewhere. The harness closes its browser and server afterwards. No third-party test dependencies are needed.

The service-worker cache version is `mtp-agriculture-g9-v19` and includes the new JavaScript and stylesheet. Upgrades delete only older MTP app caches, preserving unrelated browser/runtime caches.
