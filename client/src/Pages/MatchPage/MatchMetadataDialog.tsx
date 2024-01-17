import { MatchMetadata } from "@common/Models/MatchMetadata";
import { EditOutlined, Title } from "@mui/icons-material";
import { Button, CircularProgress, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Input, Modal, ModalDialog } from "@mui/joy";
import { Match } from "brackets-model"
import { useEffect, useState } from "react";
import { MatchAPI } from "../../APIs/MatchAPI";
import { LoadState } from "../../Utilities/LoadState";

interface MatchMetadataModal {
  tournamentId: string;
  match: Readonly<Match>
  open?: boolean;
  onAccept: (metadata: MatchMetadata) => Promise<void>;
  onCancel: () => void;
  onClose: () => void;
}

export const MatchMetadataModal: React.FC<MatchMetadataModal> = (props) => {

  const [loadState, setLoadState] = useState(LoadState.LOADING);
  const [waitingToSave,setWaitingToSave] = useState(false);
  const [metadata, setMetadata] = useState<MatchMetadata>({
    tournamentId: props.tournamentId,
    title: '',
    matchId: props.match.id as number
  });

  useEffect(() => {
    MatchAPI.getMatchMetadata(props.tournamentId, props.match.id as number).then(meta => {
      if (meta) {
        setMetadata(meta);
      }
      setLoadState(LoadState.COMPLETE);
    });
  }, [])

  function handleTitleChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setMetadata(prev => {
      return { ...prev, title: event.target.value }
    });
  }

  async function onAccept() {
    setWaitingToSave(true);
    await props.onAccept(metadata);
    props.onClose();
  }

  function onCancel() {
    props.onCancel();
    props.onClose();
  }

  const open = !!props.open;

  function renderContent() {
    switch (loadState) {
      case LoadState.LOADING:
        return (
          <DialogContent sx={{
            alignItems: 'center'
          }}>
            <CircularProgress size="lg"/>
          </DialogContent>
        )
      case LoadState.FAILED:
        return (
          <div>Error!</div>
        )
      case LoadState.COMPLETE:
        return (
          <>
            <DialogContent>
              <FormControl>
                <Input
                  value={metadata.title}
                  startDecorator={<Title />}
                  placeholder="Title"
                  type="text"
                  onChange={handleTitleChanged} />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button loading={waitingToSave} variant="solid" color="primary" onClick={onAccept}>
                Accept
              </Button>
              <Button loading={waitingToSave} variant="plain" color="neutral" onClick={onCancel}>
                Cancel
              </Button>
            </DialogActions>
          </>
        )
    }
  }

  function render() {
    return (
      <Modal open={open} onClose={props.onClose}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <EditOutlined />
            Edit Match
          </DialogTitle>
          <Divider />
          {renderContent()}
        </ModalDialog>
      </Modal>
    );
  }

  return render();
}