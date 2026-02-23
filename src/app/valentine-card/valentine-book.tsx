"use client";

import NextImage from "next/image";
import { useEffect, useState } from "react";

import styles from "./valentine-card.module.css";

type CardPage = {
  body: string;
  id: string;
  leftPage?: {
    fit?: "contain" | "cover";
    imageSrc?: string;
    position?: string;
  };
  role: "cover" | "inside" | "end";
  title: string;
};

const CARD_PAGES: CardPage[] = [
  {
    body: "",
    id: "cover",
    leftPage: {
      fit: "cover",
      imageSrc: "/vday/valentine-left-1.png",
      position: "center",
    },
    role: "cover",
    title: "Coucou",
  },
  {
    body: "A year and a half ago, I met a sexy leopard. It wasn't a banana, but it was still everything I wanted. I'm so truely happy we kiss that day.",
    id: "page-1",
    leftPage: {
      fit: "cover",
      imageSrc: "/vday/valentine-left-2.png",
      position: "center",
    },
    role: "inside",
    title: "I",
  },
  {
    body: "Thank you for always picking up my calls to listen to me blab about random things. Thank you for always making sure I'm fed and giving me your leftovers. Thank you for styling me and thinking about me whenever you go shopping. Thank you for loving me even when I'm stinky. Most of all, thank you for reminding me what it's like to be happy.",
    id: "page-2",
    leftPage: {
      fit: "cover",
      imageSrc: "/vday/valentine-left-3.png",
      position: "center",
    },
    role: "inside",
    title: "Love",
  },
  {
    body: "I love your character and for being able to be a happy person despite the messy past few months you've had. I'm happy when I wake up knowing I get to walk to you at the end of the day. I'm always shocked at how pretty you are especially when we go out on dates. The best way to put it is that you're the shrimp to my Nugget.",
    id: "page-3",
    leftPage: {
      fit: "contain",
      imageSrc: "/vday/valentine-left-4.png",
      position: "center",
    },
    role: "inside",
    title: "You",
  },
  {
    body: "- The luckiest person in the world. Who is also the sexiest hottest most alpha (better then I-geon in the pool scene) man you know.",
    id: "the-end",
    role: "end",
    title: "I love you",
  },
];

const CUSTOM_SUBTITLE = "The most amazing and beautiful angel of a person in the world.";

const FALLBACK_COVER_SVG = "/vday/valentine-cover-cutout.svg";
/** Pixels from each edge used to sample the dominant background color. */
const EDGE_SAMPLE_RADIUS = 18;
/** Max Euclidean RGB distance to be considered part of the backdrop. */
const BACKDROP_COLOR_THRESHOLD = 75;
/** Extra distance range over which alpha fades smoothly to avoid harsh edges. */
const BACKDROP_SOFT_EDGE = 28;

function removeBlueBackdrop(image: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    return FALLBACK_COVER_SVG;
  }

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  let redTotal = 0;
  let greenTotal = 0;
  let blueTotal = 0;
  let sampleCount = 0;

  const samplePixel = (x: number, y: number) => {
    const index = (y * canvas.width + x) * 4;
    redTotal += pixels[index];
    greenTotal += pixels[index + 1];
    blueTotal += pixels[index + 2];
    sampleCount += 1;
  };

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const nearLeft = x < EDGE_SAMPLE_RADIUS;
      const nearRight = x >= canvas.width - EDGE_SAMPLE_RADIUS;
      const nearTop = y < EDGE_SAMPLE_RADIUS;
      const nearBottom = y >= canvas.height - EDGE_SAMPLE_RADIUS;

      if (nearLeft || nearRight || nearTop || nearBottom) {
        samplePixel(x, y);
      }
    }
  }

  const averageRed = redTotal / sampleCount;
  const averageGreen = greenTotal / sampleCount;
  const averageBlue = blueTotal / sampleCount;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];

    const distance = Math.sqrt(
      (red - averageRed) ** 2 +
        (green - averageGreen) ** 2 +
        (blue - averageBlue) ** 2,
    );

    const likelyBlueBackdrop =
      blue >= red + 20 && green >= red + 10 && blue >= 130;

    if (distance < BACKDROP_COLOR_THRESHOLD && likelyBlueBackdrop) {
      pixels[index + 3] = 0;
      continue;
    }

    if (distance < BACKDROP_COLOR_THRESHOLD + BACKDROP_SOFT_EDGE && likelyBlueBackdrop) {
      const blend = (distance - BACKDROP_COLOR_THRESHOLD) / BACKDROP_SOFT_EDGE;
      pixels[index + 3] = Math.round(pixels[index + 3] * blend);
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export function ValentineBook() {
  const [turnedPages, setTurnedPages] = useState(0);
  const [coverArtSource, setCoverArtSource] = useState(FALLBACK_COVER_SVG);
  const maxTurns = CARD_PAGES.length - 1;
  const hasSpreadOpen = turnedPages > 0;

  useEffect(() => {
    let active = true;
    const coverImage = new window.Image();
    const coverCandidates = [
      "/vday/valentine-cover.png",
      "/vday/valentine-cover.jpg",
      "/vday/valentine-cover.jpeg",
    ];

    const tryCoverAtIndex = (index: number) => {
      if (!active) {
        return;
      }

      if (index >= coverCandidates.length) {
        setCoverArtSource(FALLBACK_COVER_SVG);
        return;
      }

      coverImage.onload = () => {
        if (!active) {
          return;
        }
        setCoverArtSource(removeBlueBackdrop(coverImage));
      };

      coverImage.onerror = () => {
        tryCoverAtIndex(index + 1);
      };

      coverImage.src = coverCandidates[index];
    };

    tryCoverAtIndex(0);

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className={styles.scene}>
      <div className={styles.glowA} />
      <div className={styles.glowB} />

      <section className={styles.cardArea}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>To: Ning</h1>
          {CUSTOM_SUBTITLE ? (
            <p className={styles.subtitle}>{CUSTOM_SUBTITLE}</p>
          ) : null}
        </header>

        <div
          className={`${styles.book} ${hasSpreadOpen ? styles.bookSpread : ""}`}
          aria-label="Virtual Valentine card with turning pages"
        >
          {CARD_PAGES.map((page, index) => {
            const isTurned = index < turnedPages;
            const isTopPage = index === turnedPages;
            const isCover = page.role === "cover";
            const isEnd = page.role === "end";
            const zIndex = isTopPage
              ? CARD_PAGES.length + 50
              : isTurned
                ? CARD_PAGES.length + index
                : CARD_PAGES.length - index;

            return (
              <article
                className={`${styles.sheet} ${isTurned ? styles.sheetTurned : ""}`}
                key={page.id}
                style={{ zIndex }}
              >
                <div className={`${styles.face} ${styles.frontFace}`}>
                  {isCover ? (
                    <div className={styles.coverLayout}>
                      <NextImage
                        alt="Banana cat cover art"
                        className={styles.coverArt}
                        height={540}
                        src={coverArtSource}
                        unoptimized
                        width={460}
                      />
                    </div>
                  ) : (
                    <div className={styles.pageContent}>
                      <h2 className={styles.pageTitle}>{page.title}</h2>
                      <p className={styles.pageBody}>{page.body}</p>
                      {isTopPage && !isEnd ? (
                        <p className={styles.pageCorner}>turn me →</p>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className={`${styles.face} ${styles.backFace}`}>
                  <div className={styles.leftPageSurface}>
                    {page.leftPage?.imageSrc ? (
                      <NextImage
                        alt={`Left page image ${index + 1}`}
                        className={styles.leftPageImage}
                        fill
                        sizes="(max-width: 900px) 86vw, 300px"
                        src={page.leftPage.imageSrc}
                        style={{
                          objectFit: page.leftPage.fit ?? "cover",
                          objectPosition: page.leftPage.position ?? "center",
                        }}
                        unoptimized
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}

          <button
            aria-label="Turn to previous page"
            className={`${styles.leftHitZone} ${hasSpreadOpen ? styles.leftHitZoneSpread : ""}`}
            disabled={turnedPages === 0}
            onClick={() => setTurnedPages((current) => Math.max(current - 1, 0))}
            type="button"
          />
          <button
            aria-label="Turn to next page"
            className={styles.rightHitZone}
            disabled={turnedPages >= maxTurns}
            onClick={() =>
              setTurnedPages((current) => Math.min(current + 1, maxTurns))
            }
            type="button"
          />
        </div>
      </section>
    </main>
  );
}
