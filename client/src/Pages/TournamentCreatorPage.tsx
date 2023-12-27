import { StageSettings, StageType } from "brackets-model";
import { Tournament } from "@common/Models/Tournament";
import { useState } from "react";
import { DateTime } from "luxon";
import { useLocation } from "wouter";
import { HOME_PAGE_URL } from "../Utilities/RouteUtils";
import { TournamentAPI } from "../APIs/TournamentAPI";

interface TournamentCreatorPageProps {
  onAccept?: (tournament: Tournament) => void;
}

export enum SeedingMode {
  MANUAL = 'manual',
  IN_ORDER = 'in_order',
  RANDOM = 'random'
}

export namespace SeedingMode {
  export function toString(mode: SeedingMode) {
    switch (mode) {
      case SeedingMode.IN_ORDER:
        return 'In Order'
      case SeedingMode.MANUAL:
        return 'Manual'
      case SeedingMode.RANDOM:
        return 'Random'
    }
  }

}

export const TournamentCreatorPage: React.FC<TournamentCreatorPageProps> = (props) => {

  const [name, setName] = useState('');
  const [mode, setMode] = useState<StageType>('single_elimination');
  const [seedingMode, setSeedingMode] = useState(SeedingMode.MANUAL);
  const [startDate, setStartDate] = useState<DateTime>(DateTime.invalid('No Value'));
  const [registrationDate,setRegistrationDate] = useState<DateTime>(DateTime.invalid('No Value'));
  const [endDate, setEndDate] = useState<DateTime>(DateTime.invalid('No Value'));


  const [, setLocation] = useLocation();

  const stageTypes: StageType[] = [
    'single_elimination',
    'double_elimination',
    'round_robin'
  ]

  function handleStartDateChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setStartDate(DateTime.fromISO(event.currentTarget.value));
  }

  function handleEndDateChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setEndDate(DateTime.fromISO(event.currentTarget.value));
  }

  function handleRegistrationOpenDateChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setRegistrationDate(DateTime.fromISO(event.currentTarget.value));
  }

  function getStageSettings(): StageSettings[] {

    const result: StageSettings = {};

    switch (mode) {
      case 'double_elimination':
        result.grandFinal = 'double'
        break;
      case 'single_elimination':
        break;
      case 'round_robin':
        break;
    }

    switch (seedingMode) {
      case SeedingMode.MANUAL:
        result.seedOrdering = ['natural']
        break;
      case SeedingMode.IN_ORDER:
        break;
      case SeedingMode.RANDOM:
        break;
    }

    return [
      result
    ]
  }

  async function accept() {
    const t = await TournamentAPI.createNewTournament({
      name,
      startDate,
      endDate,
      registrationOpenDate: registrationDate.isValid ? registrationDate : undefined,
      stages: [
        mode
      ],
      stageSettings: getStageSettings()
    });
    props.onAccept?.call(undefined,t);
    setLocation(HOME_PAGE_URL);
  }

  function canCreate() {
    return startDate.isValid && endDate.isValid && name !== '' && (endDate.diff(startDate).toMillis() >= 0);
  }

  function render() {
    return (
      <div>
        <div>
          <label>Name: </label>
          <input type="text" onChange={(e) => setName(e.currentTarget.value)}></input>
        </div>
        <div>
          <label>Start Date: </label>
          <input onChange={handleStartDateChanged} type="date"></input>
        </div>
        <div>
          <label>End Date: </label>
          <input onChange={handleEndDateChanged} type="date"></input>
        </div>
        <div>
          <label>Registration Open Date: </label>
          <input onChange={handleRegistrationOpenDateChanged} type="date"></input>
        </div>
        <div>
          <label>Mode: </label>
          <select onChange={e => setMode(e.currentTarget.value as StageType)}>
            {stageTypes.map(st => {
              return (
                <option key={st} value={st}>{
                  st.split('_').map(word => word[0].toLocaleUpperCase() + word.substring(1)).join(' ')
                }</option>
              )
            })}
          </select>
        </div>
        <div>
          <label>Seeding Mode: </label>
          <select onChange={(e) => setSeedingMode(e.currentTarget.value as SeedingMode)}>
            <option value={SeedingMode.MANUAL}>{SeedingMode.toString(SeedingMode.MANUAL)}</option>
            <option disabled value={SeedingMode.IN_ORDER}>{SeedingMode.toString(SeedingMode.IN_ORDER)}</option>
            <option disabled value={SeedingMode.RANDOM}>{SeedingMode.toString(SeedingMode.RANDOM)}</option>
          </select>
        </div>
        <button disabled={!canCreate()} onClick={accept}>Create</button>
      </div>
    )
  }

  return render();
}