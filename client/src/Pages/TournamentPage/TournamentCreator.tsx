import { StageSettings, StageType } from "brackets-model";
import { Tournament } from "@common/Models/Tournament";
import { useState } from "react";
import { DateTime } from "luxon";
import { useLocation } from "wouter";
import { TOURNAMENTS_LIST_URL } from "../../Utilities/RouteUtils";
import { TournamentAPI } from "../../APIs/TournamentAPI";
import { Container, FormControl, FormLabel, Input, Select, Option, Button, Textarea } from "@mui/joy";

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
  const [teamSize, setTeamSize] = useState<number>(1);
  const [groupCount, setGroupCount] = useState<number | undefined>(undefined);
  const [additionalDetails, setAdditionalDetails] = useState("");


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

  function handleTeamSizeChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const size = Number(event.currentTarget.value);
    setTeamSize(size);
  }

  function handleGroupCountChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    setGroupCount(value === '' ? undefined : Number(value));
  }

  function isGroupCountValid() {
    return groupCount !== undefined && Number.isInteger(groupCount) && groupCount > 0;
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
        result.groupCount = groupCount;
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
      playersSeeded: false,
      teamSize: teamSize
    });
    await TournamentAPI.setTournamentMetadata({
      id: t.id,
      registrationData: {
        details: additionalDetails
      }
    });
    props.onAccept?.call(undefined, t);
    setLocation(TOURNAMENTS_LIST_URL);
  }

  function canCreate() {
    return startDate.isValid &&
      endDate.isValid &&
      name !== '' &&
      (endDate.diff(startDate).toMillis() >= 0) &&
      teamSize > 0 &&
      (mode !== 'round_robin' || isGroupCountValid());
  }

  function render() {
    return (
      <Container className={pageStyles.container} maxWidth="sm">
        <FormControl>
          <FormLabel>Tournament Name</FormLabel>
          <Input type="text" onChange={(e) => setName(e.currentTarget.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Start Date &amp; Time</FormLabel>
          <Input onChange={handleStartDateChanged} type="datetime-local" />
        </FormControl>
        <FormControl>
          <FormLabel>End Date &amp; Time</FormLabel>
          <Input onChange={handleEndDateChanged} type="datetime-local" />
        </FormControl>
        <FormControl>
          <FormLabel>Registration Open Date &amp; Time</FormLabel>
          <Input onChange={handleRegistrationOpenDateChanged} type="datetime-local" />
        </FormControl>
        <FormControl>
          <FormLabel>Team Size</FormLabel>
          <Input value={teamSize} onChange={handleTeamSizeChanged} type="number" />
        </FormControl>
        <FormControl>
          <FormLabel>Mode</FormLabel>
          <Select value={mode} onChange={(_, v) => setMode(v!)}>
            {stageTypes.map(st => {
              return (
                <Option key={st} value={st}>{
                  st.split('_').map(word => word[0].toLocaleUpperCase() + word.substring(1)).join(' ')
                }</Option>
              )
            })}
          </Select>
        </FormControl>
        {mode === 'round_robin' && (
          <FormControl error={!isGroupCountValid()}>
            <FormLabel>Group Count</FormLabel>
            <Input
              value={groupCount ?? ''}
              onChange={handleGroupCountChanged}
              type="number"
              slotProps={{ input: { min: 1, step: 1 } }}
            />
          </FormControl>
        )}
        <FormControl>
          <FormLabel>Seeding Mode</FormLabel>
          <Select value={seedingMode} onChange={(_, v) => setSeedingMode(v!)}>
            <Option value={SeedingMode.MANUAL}>{SeedingMode.toString(SeedingMode.MANUAL)}</Option>
            <Option disabled value={SeedingMode.IN_ORDER}>{SeedingMode.toString(SeedingMode.IN_ORDER)}</Option>
            <Option disabled value={SeedingMode.RANDOM}>{SeedingMode.toString(SeedingMode.RANDOM)}</Option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Additional Details Template</FormLabel>
          <Textarea onChange={(e) => setAdditionalDetails(e.target.value)} />
        </FormControl>
        <Button disabled={!canCreate()} onClick={accept}>Create</Button>
      </Container>
    )
  }

  return render();
}