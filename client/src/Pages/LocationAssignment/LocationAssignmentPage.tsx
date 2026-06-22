import { LocationAssignmentAPIConstants } from '@common/Constants/LocationAssignmentAPIConstants';
import { Tournament, TournamentState } from '@common/Models/Tournament';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Sheet,
  Table,
  Typography,
} from '@mui/joy';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { LocationAssignmentAPI } from '../../APIs/LocationAssignmentAPI';
import { TournamentAPI } from '../../APIs/TournamentAPI';

type Phase = 'setup' | 'preview' | 'confirming' | 'done';

interface Params {
  matchDurationMinutes: number;
  gapMinutes: number;
  windowStartHour: number;
  windowStartMinute: number;
  windowEndHour: number;
  windowEndMinute: number;
}

export const LocationAssignmentPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState('');
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentIds, setSelectedTournamentIds] = useState<string[]>([]);
  const [params, setParams] = useState<Params>({
    matchDurationMinutes: 15,
    gapMinutes: 5,
    windowStartHour: 10,
    windowStartMinute: 0,
    windowEndHour: 20,
    windowEndMinute: 0,
  });
  const [preview, setPreview] = useState<LocationAssignmentAPIConstants.MatchAssignment[]>([]);
  const [phase, setPhase] = useState<Phase>('setup');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    TournamentAPI.getAllTournaments().then(t => {
      setAllTournaments(t.filter(x => x.state === TournamentState.Finalizing));
    });
  }, []);

  function addLocation() {
    const trimmed = locationInput.trim();
    if (trimmed && !locations.includes(trimmed)) {
      setLocations(prev => [...prev, trimmed]);
    }
    setLocationInput('');
  }

  function removeLocation(loc: string) {
    setLocations(prev => prev.filter(l => l !== loc));
  }

  function toggleTournament(id: string) {
    setSelectedTournamentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function updateParam<K extends keyof Params>(key: K, value: number) {
    setParams(prev => ({ ...prev, [key]: value }));
  }

  async function runAlgorithm() {
    setError(undefined);
    const request: LocationAssignmentAPIConstants.PreviewRequest = {
      tournamentIds: selectedTournamentIds,
      locations,
      ...params,
    };
    try {
      const result = await LocationAssignmentAPI.preview(request);
      const sorted = [...result].sort(
        (a, b) => a.scheduledTime.localeCompare(b.scheduledTime)
      );
      setPreview(sorted);
      setPhase('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    }
  }

  async function confirmAssignments() {
    setPhase('confirming');
    setError(undefined);
    try {
      await LocationAssignmentAPI.confirm(preview);
      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assignments.');
      setPhase('preview');
    }
  }

  function renderSetup() {
    const canRun =
      locations.length > 0 &&
      selectedTournamentIds.length > 0 &&
      params.matchDurationMinutes > 0;

    return (
      <Container maxWidth='md'>
        <Typography level='h2' sx={{ mb: 2 }}>Assign Locations</Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography level='title-md' sx={{ mb: 1 }}>Locations (Courts)</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Input
                placeholder='e.g. Court 1'
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addLocation(); }}
                sx={{ flex: 1 }}
              />
              <Button onClick={addLocation} disabled={!locationInput.trim()}>Add</Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {locations.map(loc => (
                <Sheet
                  key={loc}
                  variant='outlined'
                  sx={{ px: 1.5, py: 0.5, borderRadius: 'sm', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Typography level='body-sm'>{loc}</Typography>
                  <Button
                    size='sm'
                    variant='plain'
                    color='danger'
                    onClick={() => removeLocation(loc)}
                    sx={{ minWidth: 0, p: 0.25 }}
                  >
                    ✕
                  </Button>
                </Sheet>
              ))}
              {locations.length === 0 && (
                <Typography level='body-sm' color='neutral'>No locations added yet.</Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography level='title-md' sx={{ mb: 1 }}>Tournaments (Finalizing)</Typography>
            {allTournaments.length === 0 && (
              <Typography level='body-sm' color='neutral'>No tournaments in Finalizing state.</Typography>
            )}
            {allTournaments.map(t => (
              <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Checkbox
                  checked={selectedTournamentIds.includes(t.id)}
                  onChange={() => toggleTournament(t.id)}
                  label={`${t.name} (starts ${t.startDate.toFormat('DD')})`}
                />
              </Box>
            ))}
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography level='title-md' sx={{ mb: 1 }}>Schedule Parameters</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl>
                <FormLabel>Match Duration (minutes)</FormLabel>
                <Input
                  type='number'
                  value={params.matchDurationMinutes}
                  onChange={e => updateParam('matchDurationMinutes', Number(e.target.value))}
                  slotProps={{ input: { min: 1 } }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Gap Between Matches (minutes)</FormLabel>
                <Input
                  type='number'
                  value={params.gapMinutes}
                  onChange={e => updateParam('gapMinutes', Number(e.target.value))}
                  slotProps={{ input: { min: 0 } }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Window Start (hour)</FormLabel>
                <Input
                  type='number'
                  value={params.windowStartHour}
                  onChange={e => updateParam('windowStartHour', Number(e.target.value))}
                  slotProps={{ input: { min: 0, max: 23 } }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Window Start (minute)</FormLabel>
                <Input
                  type='number'
                  value={params.windowStartMinute}
                  onChange={e => updateParam('windowStartMinute', Number(e.target.value))}
                  slotProps={{ input: { min: 0, max: 59 } }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Window End (hour)</FormLabel>
                <Input
                  type='number'
                  value={params.windowEndHour}
                  onChange={e => updateParam('windowEndHour', Number(e.target.value))}
                  slotProps={{ input: { min: 0, max: 23 } }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Window End (minute)</FormLabel>
                <Input
                  type='number'
                  value={params.windowEndMinute}
                  onChange={e => updateParam('windowEndMinute', Number(e.target.value))}
                  slotProps={{ input: { min: 0, max: 59 } }}
                />
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Typography color='danger' sx={{ mb: 1 }}>{error}</Typography>
        )}

        <Button onClick={runAlgorithm} disabled={!canRun} size='lg'>
          Run Algorithm
        </Button>
      </Container>
    );
  }

  function renderPreview() {
    return (
      <Container maxWidth='lg'>
        <Typography level='h2' sx={{ mb: 2 }}>Preview Assignments</Typography>
        <Sheet variant='outlined' sx={{ borderRadius: 'sm', overflow: 'auto', mb: 2 }}>
          <Table>
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Match ID</th>
                <th>Location</th>
                <th>Scheduled Time</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((a, i) => (
                <tr key={i}>
                  <td>{a.tournamentName}</td>
                  <td>{a.matchId}</td>
                  <td>{a.location}</td>
                  <td>{DateTime.fromISO(a.scheduledTime).toFormat('ccc, DD t')}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
        {error && (
          <Typography color='danger' sx={{ mb: 1 }}>{error}</Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant='outlined' onClick={() => setPhase('setup')}>Back</Button>
          <Button onClick={confirmAssignments}>Confirm</Button>
        </Box>
      </Container>
    );
  }

  function renderConfirming() {
    return (
      <Container maxWidth='sm' sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Saving assignments…</Typography>
      </Container>
    );
  }

  function renderDone() {
    return (
      <Container maxWidth='sm' sx={{ textAlign: 'center', mt: 8 }}>
        <Typography level='h3' color='success'>Assignments saved successfully.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => setLocation('/')}>Done</Button>
      </Container>
    );
  }

  switch (phase) {
    case 'setup': return renderSetup();
    case 'preview': return renderPreview();
    case 'confirming': return renderConfirming();
    case 'done': return renderDone();
  }
};
