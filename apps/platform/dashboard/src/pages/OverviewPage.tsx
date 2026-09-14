// Overview: a masthead band over a two-pane split.
//
// The band answers the three questions a visitor brings to the homepage in
// one reading line — who reigns (champion), what state the subnet is in
// (vitals ledger), and when the next payout lands (epoch clock). The timeline
// and compact standings follow in a single page scroll, with the timeline
// staying alongside the standings on desktop.
//
// Standings are never hidden behind a click (ditto-platform#383): the board
// is compact here through page-scoped CSS, and the full column set lives on
// the dedicated Leaderboard page — compactness through a second surface,
// not through disclosure.
import type { JSX } from "solid-js";

import { LeaderboardBlock } from "../components/board/LeaderboardBlock";
import { leaderboardStore } from "../components/board/leaderboard-data";
import { ChampionBox } from "../components/overview/ChampionBox";
import { ChainEconomicsStrip } from "../components/overview/ChainEconomicsStrip";
import { HarnessComparison } from "../components/overview/HarnessComparison";
import { SnapshotLedger } from "../components/overview/SnapshotLedger";
import { EpochClock } from "../components/shell/EpochClock";
import type { ResourceState } from "../data/useEndpoint";
import { weightsResource } from "../data/weights";
import type { PublicChainResponse } from "../types/chain";
import type { OperationsPayload } from "../types/fleet";
import type { ChainEpoch } from "../types/leaderboard";

function latestEpoch(resource: ResourceState<{ epoch?: ChainEpoch | null }>): ChainEpoch | null {
  if (resource.error()) return null;
  try {
    return resource.data()?.epoch ?? null;
  } catch {
    return null;
  }
}

export function OverviewPage(
  props: {
    operations?: ResourceState<OperationsPayload>;
    chain?: ResourceState<PublicChainResponse>;
    /** /public/weights `epoch` for the masthead clock. Defaults to the shared
     * weights resource (the shell's tick refreshes it); tests may inject. */
    epoch?: () => ChainEpoch | null | undefined;
  } = {},
): JSX.Element {
  const store = leaderboardStore();
  const weights = props.epoch ? null : weightsResource();
  const epoch = (): ChainEpoch | null | undefined =>
    props.epoch ? props.epoch() : weights ? latestEpoch(weights) : null;
  return (
    <section class="page active" data-page="overview">
      <div class="overview-masthead" role="region" aria-label="Subnet at a glance">
        <ChampionBox store={store} />
        <SnapshotLedger store={store} operations={props.operations} />
        {/* The rail's clock is hidden while this page is on screen at desktop
            widths (shell.css), so the reading appears once. On the phone the
            sticky top bar keeps its compact clock and this one steps aside. */}
        <div class="overview-clock">
          <EpochClock epoch={epoch} id="overview-epoch-clock" />
        </div>
      </div>
      <ChainEconomicsStrip chain={props.chain} />
      <div class="overview-split">
        <aside class="overview-rail" role="region" aria-label="Memory timeline">
          <HarnessComparison store={store} />
        </aside>
        <div class="overview-main" role="region" aria-label="Current rollout leaderboard">
          <LeaderboardBlock mode="overview" />
        </div>
      </div>
    </section>
  );
}
