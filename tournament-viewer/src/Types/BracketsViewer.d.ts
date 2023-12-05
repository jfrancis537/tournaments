declare module "brackets-viewer/helpers" {
  import { Match, GroupType, MatchGame } from 'brackets-model';
  import { RankingHeader, Ranking, RankingFormula, RankingItem, Side, MatchWithMetadata } from "brackets-viewer/types";
  /**
   * Splits an array of objects based on their values at a given key.
   *
   * @param objects The array to split.
   * @param key The key of T.
   */
  export function splitBy<T extends Record<string, unknown>, K extends keyof T, U extends Record<K, string | number>>(objects: U[], key: K): U[][];
  /**
   * Splits an array of objects based on their values at a given key.
   * Objects without a value at the given key will be set under a `-1` index.
   *
   * @param objects The array to split.
   * @param key The key of T.
   */
  export function splitByWithLeftovers<T extends Record<string, unknown>, K extends keyof T, U extends Record<K, string | number>>(objects: U[], key: K): U[][];
  /**
   * Sorts the objects in the given array by a given key.
   *
   * @param array The array to sort.
   * @param key The key of T.
   */
  export function sortBy<T extends Record<string, unknown>, K extends keyof T, U extends Record<K, number>>(array: U[], key: K): U[];
  /**
   * Finds the root element
   *
   * @param selector An optional selector to select the root element.
   */
  export function findRoot(selector?: string): HTMLElement;
  /**
   * Completes a list of matches with blank matches based on the next matches.
   *
   * Toornament can generate first rounds with an odd number of matches and the seeding is partially distributed in the second round.
   * This function adds a blank match in the first round as if it was the source match of a seeded match of the second round.
   *
   * @param bracketType Type of the bracket.
   * @param matches The list of first round matches.
   * @param nextMatches The list of second round matches.
   */
  export function completeWithBlankMatches(bracketType: GroupType, matches: MatchWithMetadata[], nextMatches?: MatchWithMetadata[]): {
      matches: (MatchWithMetadata | null)[];
      fromToornament: boolean;
  };
  /**
   * Returns the abbreviation for a participant origin.
   *
   * @param matchLocation Location of the match.
   * @param skipFirstRound Whether to skip the first round.
   * @param roundNumber Number of the round.
   * @param side Side of the participant.
   */
  export function getOriginAbbreviation(matchLocation: GroupType, skipFirstRound: boolean, roundNumber?: number, side?: Side): string | null;
  /**
   * Indicates whether a round is major.
   *
   * @param roundNumber Number of the round.
   */
  export function isMajorRound(roundNumber: number): boolean;
  /**
   * Returns the header for a ranking property.
   *
   * @param itemName Name of the ranking property.
   */
  export function rankingHeader(itemName: keyof RankingItem): RankingHeader;
  /**
   * Calculates the ranking based on a list of matches and a formula.
   *
   * @param matches The list of matches.
   * @param formula The points formula to apply.
   */
  export function getRanking(matches: Match[], formula?: RankingFormula): Ranking;
  /**
   * Indicates whether the input is a match.
   *
   * @param input A match or a match game.
   */
  export function isMatch(input: Match | MatchGame): input is Match;
  /**
   * Indicates whether the input is a match game.
   *
   * @param input A match or a match game.
   */
  export function isMatchGame(input: Match | MatchGame): input is MatchGame;
}
declare module "brackets-viewer/lang" {
  import { StringMap, TOptions } from 'i18next';
  import { Stage, Status, FinalType, GroupType, StageType } from 'brackets-model';
  import { OriginHint, RoundNameInfo } from "brackets-viewer/types";
  export const locales: {
      en: {
          "origin-hint": {
              seed: string;
              "winner-bracket": string;
              "winner-bracket-semi-final": string;
              "winner-bracket-final": string;
              "consolation-final": string;
              "grand-final": string;
              "double-elimination-consolation-final-opponent-1": string;
              "double-elimination-consolation-final-opponent-2": string;
          };
          "match-label": {
              default: string;
              "winner-bracket": string;
              "loser-bracket": string;
              "standard-bracket": string;
              "standard-bracket-semi-final": string;
              "standard-bracket-final": string; /**
               * Returns an internationalized version of a locale key.
               *
               * @param key A locale key.
               * @param options Data to pass to the i18n process.
               */
              "double-elimination": string;
              "double-elimination-semi-final": string;
              "double-elimination-final": string;
              "consolation-final": string;
              "grand-final-single": string;
              "grand-final": string;
              "match-game": string;
          };
          "match-status": {
              locked: string;
              waiting: string;
              ready: string;
              running: string;
              completed: string;
              archived: string;
          };
          abbreviations: {
              win: string;
              loss: string;
              forfeit: string;
              position: string;
              seed: string;
              "winner-bracket": string;
              "loser-bracket": string;
              match: string;
              "grand-final": string;
          };
          ranking: {
              rank: {
                  text: string;
                  tooltip: string;
              };
              id: {
                  text: string;
                  tooltip: string;
              };
              played: {
                  text: string;
                  tooltip: string;
              };
              wins: {
                  text: string;
                  tooltip: string;
              };
              draws: {
                  text: string;
                  tooltip: string;
              };
              losses: {
                  text: string;
                  tooltip: string;
              };
              forfeits: {
                  text: string;
                  tooltip: string;
              };
              scoreFor: {
                  text: string;
                  tooltip: string;
              };
              scoreAgainst: {
                  text: string;
                  tooltip: string;
              };
              scoreDifference: {
                  text: string;
                  tooltip: string;
              };
              points: {
                  text: string;
                  tooltip: string;
              };
          };
          common: {
              bye: string;
              "best-of-x": string;
              consolation: string;
              "group-name": string;
              "group-name-winner-bracket": string;
              "group-name-loser-bracket": string;
              "round-name": string;
              "round-name-final": string;
              "round-name-winner-bracket": string;
              "round-name-winner-bracket-final": string;
              "round-name-loser-bracket": string;
              "round-name-loser-bracket-final": string;
          };
          "form-creator": {
              "stage-name-label": string;
              "stage-name-placeholder": string;
              "stage-selector-label": string;
              "team-label": string;
              "team-label-placeholder": string;
              "team-count": string;
              "team-count-placeholder": string;
              "group-label": string;
              "group-placeholder": string;
              "seed-order-label": string;
              "double-elimination-seed-order-placeholder": string;
              "round-robin-mode-label": string;
              "consolation-final-label": string;
              "skip-first-round-label": string;
              "grand-final-type-label": string;
              submit: string;
          };
      };
      fr: {
          "origin-hint": {
              seed: string;
              "winner-bracket": string;
              "winner-bracket-semi-final": string;
              "winner-bracket-final": string;
              "consolation-final": string;
              "grand-final": string;
              "double-elimination-consolation-final-opponent-1": string;
              "double-elimination-consolation-final-opponent-2": string;
          };
          "match-label": {
              default: string;
              "winner-bracket": string;
              "loser-bracket": string;
              "standard-bracket": string;
              "standard-bracket-semi-final": string;
              "standard-bracket-final": string;
              "double-elimination": string;
              "double-elimination-semi-final": string;
              "double-elimination-final": string;
              "consolation-final": string;
              "grand-final-single": string;
              "grand-final": string;
              "match-game": string;
          };
          "match-status": {
              locked: string;
              waiting: string;
              ready: string;
              running: string;
              completed: string;
              archived: string;
          };
          abbreviations: {
              win: string;
              loss: string;
              forfeit: string;
              position: string;
              seed: string;
              "winner-bracket": string;
              "loser-bracket": string;
              match: string;
              "grand-final": string;
          };
          ranking: {
              rank: {
                  text: string;
                  tooltip: string;
              };
              id: {
                  text: string;
                  tooltip: string;
              };
              played: {
                  text: string;
                  tooltip: string;
              };
              wins: {
                  text: string;
                  tooltip: string;
              };
              draws: {
                  text: string;
                  tooltip: string;
              };
              losses: {
                  text: string;
                  tooltip: string;
              };
              forfeits: {
                  text: string;
                  tooltip: string;
              };
              scoreFor: {
                  text: string;
                  tooltip: string;
              };
              scoreAgainst: {
                  text: string;
                  tooltip: string;
              };
              scoreDifference: {
                  text: string;
                  tooltip: string;
              };
              points: {
                  text: string;
                  tooltip: string;
              };
          };
          common: {
              bye: string;
              "best-of-x": string;
              consolation: string;
              "group-name": string;
              "group-name-winner-bracket": string;
              "group-name-loser-bracket": string;
              "round-name": string;
              "round-name-final": string;
              "round-name-winner-bracket": string;
              "round-name-winner-bracket-final": string;
              "round-name-loser-bracket": string;
              "round-name-loser-bracket-final": string;
          };
          "form-creator": {
              "stage-name-label": string;
              "stage-name-placeholder": string;
              "stage-selector-label": string;
              "team-label": string;
              "team-placeholder": string;
              "team-count": string;
              "team-count-placeholder": string;
              "group-label": string;
              "group-placeholder": string;
              "seed-order-label": string;
              "double-elimination-seed-order-placeholder": string;
              "round-robin-mode-label": string;
              "consolation-final-label": string;
              "skip-first-round-label": string;
              "grand-final-type-label": string;
              submit: string;
          };
      };
  };
  export type Locale = typeof locales['en'];
  /**
   * Adds a locale to the available i18n bundles.
   *
   * @param name Name of the locale.
   * @param locale Contents of the locale.
   */
  export function addLocale(name: string, locale: Locale): Promise<void>;
  /**
   * Returns an internationalized version of a locale key.
   *
   * @param key A locale key.
   * @param options Data to pass to the i18n process.
   */
  export function t<Scope extends keyof Locale, SubKey extends string & keyof Locale[Scope], T extends TOptions>(key: `${Scope}.${SubKey}`, options?: T): T['returnObjects'] extends true ? StringMap : string;
  export type Translator = typeof t;
  export type ToI18nKey<S extends string> = S extends `${infer A}_${infer B}` ? `${A}-${B}` : never;
  /**
   * Converts a type to a valid i18n key.
   *
   * @param key The key to convert.
   */
  export function toI18nKey<S extends `${string}_${string}`>(key: S): ToI18nKey<S>;
  /**
   * Returns an origin hint function based on rounds information.
   *
   * @param roundNumber Number of the round.
   * @param roundCount Count of rounds.
   * @param skipFirstRound Whether to skip the first round.
   * @param matchLocation Location of the match.
   */
  export function getOriginHint(roundNumber: number, roundCount: number, skipFirstRound: boolean, matchLocation: GroupType): OriginHint | undefined;
  /**
   * Returns an origin hint function for a match in final.
   *
   * @param stageType Type of the stage.
   * @param finalType Type of the final.
   * @param roundNumber Number of the round.
   */
  export function getFinalOriginHint(stageType: StageType, finalType: FinalType, roundNumber: number): OriginHint | undefined;
  /**
   * Returns the label of a match.
   *
   * @param matchNumber Number of the match.
   * @param roundNumber Number of the round.
   * @param roundCount Count of rounds.
   * @param matchLocation Location of the match.
   */
  export function getMatchLabel(matchNumber: number, roundNumber?: number, roundCount?: number, matchLocation?: GroupType): string;
  /**
   * Returns the label of a match in final.
   *
   * @param finalType Type of the final.
   * @param roundNumber Number of the round.
   * @param roundCount Count of rounds.
   */
  export function getFinalMatchLabel(finalType: FinalType, roundNumber: number, roundCount: number): string;
  /**
   * Returns the status of a match.
   *
   * @param status The match status.
   */
  export function getMatchStatus(status: Status): string;
  /**
   * Returns the name of a group.
   *
   * @param groupNumber Number of the group.
   */
  export function getGroupName(groupNumber: number): string;
  /**
   * Returns the name of the bracket.
   *
   * @param stage The current stage.
   * @param type Type of the bracket.
   */
  export function getBracketName(stage: Stage, type: GroupType): string | undefined;
  /**
   * Returns the name of a round.
   */
  export function getRoundName({ roundNumber, roundCount }: RoundNameInfo, t: Translator): string;
  /**
   * Returns the name of a round in the winner bracket of a double elimination stage.
   */
  export function getWinnerBracketRoundName({ roundNumber, roundCount }: RoundNameInfo, t: Translator): string;
  /**
   * Returns the name of a round in the loser bracket of a double elimination stage.
   */
  export function getLoserBracketRoundName({ roundNumber, roundCount }: RoundNameInfo, t: Translator): string;
}
declare module "brackets-viewer/form" {
  import { InputStage } from 'brackets-model';
  export type CallbackFunction = (config: InputStage) => void;
  export type FormConfiguration = {
      parent_id: string;
      html_name_id: string;
      html_stage_type_selector_id: string;
      html_team_names_input_id: string;
      html_team_count_input_id: string;
      html_group_id: string;
      html_seed_order_id: string;
      html_round_robin_mode_id: string;
      html_consolation_final_checkbox_id: string;
      html_skip_first_round_checkbox_id: string;
      html_grand_final_type_id: string;
      html_double_elimination_seed_textarea_id: string;
      group_default_size: number;
  };
  /**
   * Creates a DOM form to create different stages for the brackets-manager
   *
   * @param configuration HTML element IDs to render this form to
   * @param submitCallable Callback function - what should happen onClick on the forms submit button?
   */
  export function stageFormCreator(configuration: FormConfiguration, submitCallable: CallbackFunction): void;
  /**
   * Creates a DOM form to update the current stage.
   *
   * @param configuration HTML element IDs to render this form to
   * @param changeCallable Callback function - what should happen onClick on the forms submit button?
   */
  export function updateFormCreator(configuration: FormConfiguration, changeCallable: CallbackFunction): void;
}
declare module "brackets-viewer/main" {
  import './style.scss';
  import { Match, Id } from 'brackets-model';
  import { Locale } from "brackets-viewer/lang";
  import { Config, ViewerData, ParticipantImage, MatchClickCallback } from "brackets-viewer/types";
  export class BracketsViewer {
      readonly participantRefs: Record<Id, HTMLElement[]>;
      private participants;
      private participantImages;
      private stage;
      private config;
      private skipFirstRound;
      private alwaysConnectFirstRound;
      private popover;
      private getRoundName;
      private _onMatchClick;
      private _onMatchLabelClick;
      /**
       * @deprecated Use `onMatchClick` in the `config` parameter of `viewer.render()`.
       * @param callback A callback to be called when a match is clicked.
       */
      set onMatchClicked(callback: MatchClickCallback);
      /**
       * Renders data generated with `brackets-manager.js`. If multiple stages are given, they will all be displayed.
       *
       * Stages won't be discriminated visually based on the tournament they belong to.
       *
       * @param data The data to display.
       * @param config An optional configuration for the viewer.
       */
      render(data: ViewerData, config?: Partial<Config>): Promise<void>;
      /**
       * Updates the results of an existing match.
       *
       * @param match The match to update.
       */
      updateMatch(match: Match): void;
      /**
       * Sets the images which will be rendered for every participant.
       *
       * @param images The participant images.
       */
      setParticipantImages(images: ParticipantImage[]): void;
      /**
       * Adds a locale to the available i18n bundles.
       *
       * @param name Name of the locale.
       * @param locale Contents of the locale.
       */
      addLocale(name: string, locale: Locale): Promise<void>;
      /**
       * Renders a stage (round-robin, single or double elimination).
       *
       * @param root The root element.
       * @param data The data to display.
       */
      private renderStage;
      /**
       * Renders a round-robin stage.
       *
       * @param root The root element.
       * @param stage The stage to render.
       * @param matchesByGroup A list of matches for each group.
       */
      private renderRoundRobin;
      /**
       * Renders an elimination stage (single or double).
       *
       * @param root The root element.
       * @param stage The stage to render.
       * @param matchesByGroup A list of matches for each group.
       */
      private renderElimination;
      /**
       * Renders a list of consolation matches.
       *
       * @param root The root element.
       * @param stage The stage to render.
       * @param matchesByGroup A list of matches for each group.
       */
      private renderConsolationMatches;
      /**
       * Renders a single elimination stage.
       *
       * @param container The container to render into.
       * @param matchesByGroup A list of matches for each group.
       */
      private renderSingleElimination;
      /**
       * Renders a double elimination stage.
       *
       * @param container The container to render into.
       * @param matchesByGroup A list of matches for each group.
       */
      private renderDoubleElimination;
      /**
       * Returns information about the final group in single elimination.
       *
       * @param matchesByGroup A list of matches for each group.
       */
      private getFinalInfoSingleElimination;
      /**
       * Returns information about the final group in double elimination.
       *
       * @param matchesByGroup A list of matches for each group.
       */
      private getFinalInfoDoubleElimination;
      /**
       * Renders a bracket.
       *
       * @param container The container to render into.
       * @param matchesByRound A list of matches for each round.
       * @param getRoundName A function giving a round's name based on its number.
       * @param bracketType Type of the bracket.
       * @param connectFinal Whether to connect the last match of the bracket to the first match of the final group.
       */
      private renderBracket;
      /**
       * Renders a final group.
       *
       * @param container The container to render into.
       * @param finalType Type of the final.
       * @param matches Matches of the final.
       */
      private renderFinal;
      /**
       * Creates a ranking table based on matches of a round-robin stage.
       *
       * @param matches The list of matches.
       */
      private createRanking;
      /**
       * Creates a row of the ranking table.
       *
       * @param item Item of the ranking.
       */
      private createRankingRow;
      /**
       * Creates a match in a bracket.
       *
       * @param match Information about the match.
       */
      private createBracketMatch;
      /**
       * Creates a match in a final.
       *
       * @param finalType Type of the final.
       * @param match Information about the match.
       */
      private createFinalMatch;
      /**
       * Creates a hidden empty match to act as a placeholder.
       */
      private skipBracketMatch;
      /**
       * Creates a match based on its results.
       *
       * @param match Results of the match.
       * @param propagateHighlight Whether to highlight participants in other matches.
       */
      private createMatch;
      /**
       * Creates a participant for a match.
       *
       * @param participant Information about the participant.
       * @param propagateHighlight Whether to highlight the participant in other matches.
       * @param side Side of the participant.
       * @param originHint Origin hint for the match.
       * @param matchLocation Location of the match.
       * @param roundNumber Number of the round.
       */
      private createParticipant;
      /**
       * Renders a participant.
       *
       * @param containers Containers for the participant.
       * @param participant The participant result.
       * @param side Side of the participant.
       * @param originHint Origin hint for the match.
       * @param matchLocation Location of the match.
       * @param roundNumber Number of the round.
       */
      private renderParticipant;
      /**
       * Renders a participant image.
       *
       * @param nameContainer The name container.
       * @param participantId ID of the participant.
       */
      private renderParticipantImage;
      /**
       * Renders a match label.
       *
       * @param opponents The opponents container.
       * @param match Results of the match.
       */
      private renderMatchLabel;
      /**
       * Show a popover to display the games of a match.
       *
       * @param match The parent match.
       */
      private showPopover;
      /**
       * Renders an origin hint for a participant.
       *
       * @param nameContainer The name container.
       * @param participant The participant result.
       * @param originHint Origin hint for the participant.
       * @param matchLocation Location of the match.
       */
      private renderHint;
      /**
       * Renders a participant's origin.
       *
       * @param nameContainer The name container.
       * @param participant The participant result.
       * @param side Side of the participant.Side of the participant.
       * @param matchLocation Location of the match.
       * @param roundNumber Number of the round.
       */
      private renderParticipantOrigin;
      /**
       * Sets mouse hover events for a participant.
       *
       * @param participantId ID of the participant.
       * @param element The dom element to add events to.
       * @param propagateHighlight Whether to highlight the participant in other matches.
       */
      private setupMouseHover;
      /**
       * Clears any previous popover selections.
       */
      private clearPreviousPopoverSelections;
  }
}
declare module "brackets-viewer/types" {
  import { Stage, Match, MatchGame, Participant, GroupType, FinalType, Id, StageType } from 'brackets-model';
  import { CallbackFunction, FormConfiguration } from "brackets-viewer/form";
  import { InMemoryDatabase } from 'brackets-memory-db';
  import { BracketsViewer } from "brackets-viewer/main";
  import { BracketsManager } from 'brackets-manager';
  import { ToI18nKey, Translator } from "brackets-viewer/lang";
  global {
      interface Window {
          bracketsViewer: BracketsViewer;
          inMemoryDatabase: InMemoryDatabase;
          bracketsManager: BracketsManager;
          stageFormCreator: (configuration: FormConfiguration, submitCallable: CallbackFunction) => void;
          updateFormCreator: (configuration: FormConfiguration, changeCallable: CallbackFunction) => void;
      }
      interface HTMLElement {
          togglePopover: () => void;
      }
      interface ToggleEvent extends Event {
          oldState: 'open' | 'closed';
          newState: 'open' | 'closed';
      }
  }
  /**
   * A match with metadata constructed by the viewer.
   */
  export interface MatchWithMetadata extends Match {
      metadata: {
          /** Type of the stage this match is in. */
          stageType: StageType;
          /** The list of child games of this match. */
          games: MatchGame[];
          /** Label as shown in the UI */
          label?: string;
          /** Number of the round this match is in. */
          roundNumber?: number;
          /** Count of rounds in the group this match is in. */
          roundCount?: number;
          /** Group type this match is in. */
          matchLocation?: GroupType;
          /** Whether to connect this match to the final if it happens to be the last one of the bracket. */
          connectFinal?: boolean;
          /** Whether to connect this match with previous or next matches. */
          connection?: Connection;
          /** Function returning an origin hint based on a participant's position for this match. */
          originHint?: OriginHint;
      };
  }
  export interface MatchGameWithMetadata extends MatchGame {
      metadata: {
          /** Label as shown in the UI */
          label?: string;
      };
  }
  /**
   * The data to display with `brackets-viewer.js`
   */
  export interface ViewerData {
      /** The stages to display. */
      stages: Stage[];
      /** The matches of the stage to display. */
      matches: Match[];
      /** The games of the matches to display. */
      matchGames: MatchGame[];
      /** The participants who play in the stage to display. */
      participants: Participant[];
  }
  /**
   * The data to display with `brackets-viewer.js`
   */
  export interface InternalViewerData {
      /** The stages to display. */
      stages: Stage[];
      /** The matches of the stage to display. */
      matches: MatchWithMetadata[];
      /** The participants who play in the stage to display. */
      participants: Participant[];
  }
  /**
   * The possible placements of a participant's origin.
   */
  export type Placement = 'none' | 'before' | 'after';
  /**
   * The possible sides of a participant.
   */
  export type Side = 'opponent1' | 'opponent2';
  /**
   * An optional config to provide to `brackets-viewer.js`
   */
  export interface Config {
      /**
       * A callback to be called when a match is clicked.
       */
      onMatchClick?: MatchClickCallback;
      /**
       * A callback to be called when a match's label is clicked.
       */
      onMatchLabelClick?: MatchClickCallback;
      /**
       * A function to deeply customize the names of the rounds.
       * If you just want to **translate some words**, please use `addLocale()` instead.
       */
      customRoundName?: (...args: Parameters<RoundNameGetter>) => ReturnType<RoundNameGetter> | undefined;
      /**
       * An optional selector to select the root element.
       */
      selector?: string;
      /**
       * Where the position of a participant is placed relative to its name.
       * - If `none`, the position is not added.
       * - If `before`, the position is prepended before the participant name. "#1 Team"
       * - If `after`, the position is appended after the participant name, in parentheses. "Team (#1)"
       */
      participantOriginPlacement?: Placement;
      /**
       * Whether to show the child count of a BoX match separately in the match label.
       * - If `false`, the match label and the child count are in the same place. (Example: "M1.1, Bo3")
       * - If `true`, the match label and the child count are in an opposite place. (Example: "M1.1   (right-->) Bo3")
       */
      separatedChildCountLabel?: boolean;
      /**
       * Whether to show the origin of a slot (wherever possible).
       */
      showSlotsOrigin?: boolean;
      /**
       * Whether to show the origin of a slot (in the lower bracket of an elimination stage).
       */
      showLowerBracketSlotsOrigin?: boolean;
      /**
       * Display a popover when the label of a match with child games is clicked.
       */
      showPopoverOnMatchLabelClick?: boolean;
      /**
       * Whether to highlight every instance of a participant on hover.
       */
      highlightParticipantOnHover?: boolean;
      /**
       * Whether to show a ranking table on round-robin stages.
       */
      showRankingTable?: boolean;
      /**
       * Whether to clear any previously displayed data.
       */
      clear?: boolean;
  }
  /**
   * The possible types of connection between matches.
   */
  export type ConnectionType = 'square' | 'straight' | false;
  /**
   * A function returning an origin hint based on a participant's position.
   */
  export type OriginHint = (position: number) => string;
  /**
   * Info associated to a round in order to name its header.
   */
  export type RoundNameInfo = {
      groupType: Exclude<ToI18nKey<GroupType>, 'final-group'>;
      roundNumber: number;
      roundCount: number;
      /**
       * `1` = final, `1/2` = semi finals, `1/4` = quarter finals, etc.
       */
      fractionOfFinal: number;
  } | {
      groupType: 'round-robin';
      roundNumber: number;
      roundCount: number;
  } | {
      groupType: 'final-group';
      finalType: ToI18nKey<FinalType>;
      roundNumber: number;
      roundCount: number;
  };
  /**
   * A function returning a round name based on its number and the count of rounds.
   */
  export type RoundNameGetter = (info: RoundNameInfo, t: Translator) => string;
  /**
   * A function called when a match is clicked.
   */
  export type MatchClickCallback = (match: MatchWithMetadata) => void;
  /**
   * Contains the information about the connections of a match.
   */
  export interface Connection {
      connectPrevious?: ConnectionType;
      connectNext?: ConnectionType;
  }
  /**
   * An item of the ranking.
   */
  export interface RankingItem {
      rank: number;
      id: Id;
      played: number;
      wins: number;
      draws: number;
      losses: number;
      forfeits: number;
      scoreFor: number;
      scoreAgainst: number;
      scoreDifference: number;
      points: number;
  }
  /**
   * Contains information about a header of the ranking and its tooltip.
   */
  export interface RankingHeader {
      text: string;
      tooltip: string;
  }
  /**
   * A formula which computes points given a ranking row.
   */
  export type RankingFormula = (ranking: RankingItem) => number;
  /**
   * An object mapping ranking properties to their header.
   */
  export type RankingHeaders = Record<keyof RankingItem, RankingHeader>;
  /**
   * An object mapping a participant id to its row in the ranking.
   */
  export type RankingMap = Record<Id, RankingItem>;
  /**
   * Definition of a ranking.
   */
  export type Ranking = RankingItem[];
  /**
   * Structure containing all the containers for a participant.
   */
  export interface ParticipantContainers {
      participant: HTMLElement;
      name: HTMLElement;
      result: HTMLElement;
  }
  /**
   * Image associated to a participant.
   */
  export interface ParticipantImage {
      participantId: number;
      imageUrl: string;
  }
}
declare module "brackets-viewer/dom" {
  import { Match, ParticipantResult, FinalType, GroupType, Id, MatchGame } from 'brackets-model';
  import { Connection, Placement, Ranking } from "brackets-viewer/types";
  /**
   * Creates the title of the viewer.
   *
   * @param title The title to set.
   */
  export function createTitle(title: string): HTMLElement;
  /**
   * Creates the title of a popover.
   *
   * @param title The title to set.
   */
  export function createPopoverTitle(title: string): HTMLElement;
  /**
   * Creates a container which contains a round-robin stage.
   *
   * @param stageId ID of the stage.
   */
  export function createRoundRobinContainer(stageId: Id): HTMLElement;
  /**
   * Creates a container which contains an elimination stage.
   *
   * @param stageId ID of the stage.
   */
  export function createEliminationContainer(stageId: Id): HTMLElement;
  /**
   * Creates a container which contains one bracket of a single or double elimination stage.
   *
   * @param groupId ID of the group.
   * @param title Title of the group.
   */
  export function createBracketContainer(groupId?: Id, title?: string): HTMLElement;
  /**
   * Creates a container which contains a group for round-robin stages.
   *
   * @param groupId ID of the group.
   * @param title Title of the group.
   */
  export function createGroupContainer(groupId: Id, title: string): HTMLElement;
  /**
   * Creates a container which contains a list of rounds.
   */
  export function createRoundsContainer(): HTMLElement;
  /**
   * Creates a container which contains a round.
   *
   * @param roundId ID of the round.
   * @param title Title of the round.
   */
  export function createRoundContainer(roundId: Id, title: string): HTMLElement;
  /**
   * Creates a container which contains a match.
   *
   * @param match A match or a match game.
   */
  export function createMatchContainer(match?: Match | MatchGame): HTMLElement;
  /**
   * Creates a container which contains the label of a match.
   *
   * @param label The label of the match.
   * @param status The status to set as tooltip.
   * @param onClick Called when the label is clicked.
   */
  export function createMatchLabel(label: string | undefined, status: string, onClick?: (event: MouseEvent) => void): HTMLElement;
  /**
   * Creates a container which contains the child count label of a match.
   *
   * @param label The child count label of the match.
   * @param onClick Called when the label is clicked.
   */
  export function createChildCountLabel(label: string, onClick?: (event: MouseEvent) => void): HTMLElement;
  /**
   * Creates a container which contains the opponents of a match.
   *
   * @param onClick Called when the match is clicked.
   */
  export function createOpponentsContainer(onClick?: () => void): HTMLElement;
  /**
   * Creates a container which contains a participant.
   *
   * @param participantId ID of the participant.
   */
  export function createParticipantContainer(participantId: Id | null): HTMLElement;
  /**
   * Creates a container which contains the name of a participant.
   */
  export function createNameContainer(): HTMLElement;
  /**
   * Creates a container which contains the result of a match for a participant.
   */
  export function createResultContainer(): HTMLElement;
  /**
   * Creates a table.
   */
  export function createTable(): HTMLElement;
  /**
   * Creates a table row.
   */
  export function createRow(): HTMLElement;
  /**
   * Creates a table cell.
   *
   * @param data The data in the cell.
   */
  export function createCell(data: string | number): HTMLElement;
  /**
   * Creates the headers for a ranking table.
   *
   * @param ranking The object containing the ranking.
   */
  export function createRankingHeaders(ranking: Ranking): HTMLElement;
  /**
   * Sets a hint on a name container.
   *
   * @param nameContainer The name container.
   * @param hint The hint to set.
   */
  export function setupHint(nameContainer: HTMLElement, hint: string): void;
  /**
   * Sets a BYE on a name container.
   *
   * @param nameContainer The name container.
   */
  export function setupBye(nameContainer: HTMLElement): void;
  /**
   * Sets a win for a participant.
   *
   * @param participantContainer The participant container.
   * @param resultContainer The result container.
   * @param participant The participant result.
   */
  export function setupWin(participantContainer: HTMLElement, resultContainer: HTMLElement, participant: ParticipantResult): void;
  /**
   * Sets a loss for a participant.
   *
   * @param participantContainer The participant container.
   * @param resultContainer The result container.
   * @param participant The participant result.
   */
  export function setupLoss(participantContainer: HTMLElement, resultContainer: HTMLElement, participant: ParticipantResult): void;
  /**
   * Adds the participant origin to a name.
   *
   * @param nameContainer The name container.
   * @param text The text to set (origin).
   * @param placement The placement of the participant origin.
   */
  export function addParticipantOrigin(nameContainer: HTMLElement, text: string, placement: Placement): void;
  /**
   * Adds the participant image to a name.
   *
   * @param nameContainer The name container.
   * @param src Source of the image.
   */
  export function addParticipantImage(nameContainer: HTMLElement, src: string): void;
  /**
   * Returns the connection for a given round in a bracket.
   *
   * @param alwaysConnectFirstRound Whether to always connect the first round with the second round.
   * @param roundNumber Number of the round.
   * @param roundCount Count of rounds.
   * @param match The match to connect to other matches.
   * @param matchLocation Location of the match.
   * @param connectFinal Whether to connect to the final.
   */
  export function getBracketConnection(alwaysConnectFirstRound: boolean, roundNumber: number, roundCount: number, match: Match, matchLocation?: GroupType, connectFinal?: boolean): Connection;
  /**
   * Returns the connection for a given round in the final.
   *
   * @param finalType Type of final.
   * @param roundNumber Number of the round.
   * @param matchCount The count of matches.
   */
  export function getFinalConnection(finalType: FinalType, roundNumber: number, matchCount: number): Connection;
  /**
   * Sets the connection a match containers.
   *
   * @param opponentsContainer The opponents container.
   * @param matchContainer The match container.
   * @param connection The connection to set.
   */
  export function setupConnection(opponentsContainer: HTMLElement, matchContainer: HTMLElement, connection: Connection): void;
}
declare module "brackets-viewer/index" {
  import { BracketsViewer } from "brackets-viewer/main";
  export { BracketsViewer };
  export { ToI18nKey } from "brackets-viewer/lang";
  export { Config, MatchClickCallback, Placement, ViewerData, ParticipantImage, RoundNameInfo, MatchWithMetadata, Connection, ConnectionType, OriginHint, } from "brackets-viewer/types";
}
