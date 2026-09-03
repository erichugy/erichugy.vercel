import SqlErdClient from "./sql-erd-client";

export const metadata = {
  title: "SQL ERD Visualizer | Eric Huang",
  description:
    "Paste or upload SQL files and get a live entity-relationship diagram you can rearrange, re-wire and export.",
};

export default function SqlErdPage() {
  return <SqlErdClient />;
}
