import { StageSettings, StageType } from "brackets-model";
import { Tournament } from "@common/Models/Tournament";
import { useState } from "react";
import { DateTime } from "luxon";
import { useLocation } from "wouter";
import { HOME_PAGE_URL } from "../../Utilities/RouteUtils";
import { TournamentAPI } from "../../APIs/TournamentAPI";
import { Container, FormControl, FormLabel, Input, Select, Option, Button } from "@mui/joy";

import pageStyles from './TournamentCreator.module.css';

interface TournamentCreatorProps {
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

export const TournamentCreator: React.FC<TournamentCreatorProps> = (props) => {

  const [name, setName] = useState('');
  const [mode, setMode] = useState<StageType>('single_elimination');
  const [seedingMode, setSeedingMode] = useState(SeedingMode.MANUAL);
  const [startDate, setStartDate] = useState<DateTime>(DateTime.invalid('No Value'));
  const [registrationDate, setRegistrationDate] = useState<DateTime>(DateTime.invalid('No Value'));
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
      stageSettings: getStageSettings(),
      playersSeeded: false
    });
    props.onAccept?.call(undefined, t);
    setLocation(HOME_PAGE_URL);
  }

  function canCreate() {
    return startDate.isValid && endDate.isValid && name !== '' && (endDate.diff(startDate).toMillis() >= 0);
  }

  function render() {
    return (
      <Container className={pageStyles.container} maxWidth="sm">
        <FormControl>
          <FormLabel>Tournament Name</FormLabel>
          <Input type="text" onChange={(e) => setName(e.currentTarget.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Start Date</FormLabel>
          <Input onChange={handleStartDateChanged} type="date" />
        </FormControl>
        <FormControl>
          <FormLabel>End Date</FormLabel>
          <Input onChange={handleEndDateChanged} type="date" />
        </FormControl>
        <FormControl>
          <FormLabel>Registration Open Date</FormLabel>
          <Input onChange={handleRegistrationOpenDateChanged} type="date" />
        </FormControl>
        <FormControl>
          <FormLabel>Mode</FormLabel>
          <Select value={mode} onChange={(_, v) => setMode(v!)}>
            {stageTypes.map(st => {
              return (
                <Option key={st} value={st} onSelect={console.log}>{
                  st.split('_').map(word => word[0].toLocaleUpperCase() + word.substring(1)).join(' ')
                }</Option>
              )
            })}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Seeding Mode</FormLabel>
          <Select value={seedingMode} onChange={(_, v) => setSeedingMode(v!)}>
            <Option value={SeedingMode.MANUAL}>{SeedingMode.toString(SeedingMode.MANUAL)}</Option>
            <Option disabled value={SeedingMode.IN_ORDER}>{SeedingMode.toString(SeedingMode.IN_ORDER)}</Option>
            <Option disabled value={SeedingMode.RANDOM}>{SeedingMode.toString(SeedingMode.RANDOM)}</Option>
          </Select>
        </FormControl>
        <Button disabled={!canCreate()} onClick={accept}>Create</Button>
      </Container>
    )
  }

  return render();
}