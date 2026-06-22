import { LocationAssignmentAPIConstants } from "@common/Constants/LocationAssignmentAPIConstants";
import { HttpStatusError } from "../Errors/HttpStatusError";

export namespace LocationAssignmentAPI {

  export async function preview(
    request: LocationAssignmentAPIConstants.PreviewRequest
  ): Promise<LocationAssignmentAPIConstants.MatchAssignment[]> {
    const resp = await fetch(
      `${LocationAssignmentAPIConstants.BASE_PATH}${LocationAssignmentAPIConstants.PREVIEW}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (resp.ok) {
      return resp.json() as Promise<LocationAssignmentAPIConstants.MatchAssignment[]>;
    }
    const body = await resp.json().catch(() => ({})) as { error?: string };
    throw new HttpStatusError(body.error ?? 'Failed to generate preview.', resp.status);
  }

  export async function confirm(
    assignments: LocationAssignmentAPIConstants.MatchAssignment[]
  ): Promise<void> {
    const request: LocationAssignmentAPIConstants.ConfirmRequest = { assignments };
    const resp = await fetch(
      `${LocationAssignmentAPIConstants.BASE_PATH}${LocationAssignmentAPIConstants.CONFIRM}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!resp.ok) {
      throw new HttpStatusError('Failed to confirm location assignments.', resp.status);
    }
  }
}
