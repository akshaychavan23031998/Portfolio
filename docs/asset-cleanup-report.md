# Root asset cleanup report

## Audit method

1. Enumerated root image and PDF assets.
2. Calculated SHA-256 checksums for every root candidate.
3. Compared each checksum with all files under `public/`.
4. Searched application and test source for image/PDF references.
5. Confirmed the application references only the organized `/images/...` and `/resume/...` public paths.

## Exact duplicate candidates

Every file below has a byte-identical public copy and no source reference to its root filename:

| Root file                                     | Public copy                                       |
| --------------------------------------------- | ------------------------------------------------- |
| `Akshay_Ram_Chavan_23rd_July_2026.pdf`        | `public/resume/akshay-ram-chavan-resume.pdf`      |
| `ChatGPT Image Jul 23, 2026, 03_56_38 PM.png` | `public/images/profile/akshay-ram-chavan.png`     |
| `pro_rabbit.png`                              | `public/images/projects/rabbit-ecommerce.png`     |
| `pro_quickblog.png`                           | `public/images/projects/ai-quick-blog.png`        |
| `pro_quickchat.png`                           | `public/images/projects/quick-chat.png`           |
| `pro_giphy.jpg`                               | `public/images/projects/giphy-clone.jpg`          |
| `pro_netflix.jpg`                             | `public/images/projects/netflix-gpt.jpg`          |
| `pro_ochi.png`                                | `public/images/projects/ochi-agency.png`          |
| `pro_obys.png`                                | `public/images/projects/obys-agency.png`          |
| `pro_sundown.jpg`                             | `public/images/projects/sundown-studio.jpg`       |
| `pro_lazarev.jpg`                             | `public/images/projects/lazarev-agency.jpg`       |
| `rahul.jpg`                                   | `public/images/testimonials/rahul-chavan.jpg`     |
| `shree.png`                                   | `public/images/testimonials/shirish-yenganti.png` |
| `muzzu.png`                                   | `public/images/testimonials/muzzamil-shaikh.png`  |
| `mu.png`                                      | `public/images/testimonials/muzammil-alloli.png`  |

## Retained

- `akshay-engineering-portfolio-final-responsive-fixed.html` is the protected visual source of truth and is not a cleanup candidate.
- All organized `public/` copies are retained.
- Configuration, source, documentation, and test artifacts are retained.
- `debug.log` and generated caches are not removed until validation determines whether they are tracked or useful.

## Cleanup result

After formatting, linting, type checking, unit tests, a production build, and E2E checks confirmed the public copies were used successfully, all 15 exact root duplicates listed above were removed. The organized public copies remain in place and a post-cleanup production build passed.
