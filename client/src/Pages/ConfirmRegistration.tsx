import { Card, CardContent, CircularProgress, Container, Typography } from "@mui/joy";
import { useEffect, useState } from "react";

import pageStyles from "./ConfirmRegistratration.module.css";
import { Link } from "wouter";
import { AuthAPI } from "../APIs/AuthAPI";
import { ConfirmAccountResult } from "@common/Constants/AuthAPIConstants";

interface ConfirmRegistrationProps {
  token: string;
}

export const ConfirmRegistration: React.FC<ConfirmRegistrationProps> = (props) => {

  const [confirmationResult, setConfirmed] = useState<ConfirmAccountResult>();

  useEffect(() => {
    AuthAPI.confirmAccount(props.token).then(setConfirmed);
  }, [])

  function renderContent() {

    if (confirmationResult === undefined) {
      return (
        <>
          <Typography level="title-lg">Confirming Account...</Typography>
          <CircularProgress size='lg' />
        </>
      )
    }

    switch (confirmationResult) {
      case ConfirmAccountResult.SUCCESS:
        return (
          <>
            <Typography level="title-lg">Account Confirmed!</Typography>
            <Typography level="body-md">
              You may now&nbsp;
              <Link href="/account/login">login.</Link>
            </Typography>
          </>
        )
      case ConfirmAccountResult.NO_SUCH_USER:
        return (
          <>
            <Typography level="title-lg">Link Expired!</Typography>
            <Typography level="body-md">You may need to register again.</Typography>
          </>
        )
      case ConfirmAccountResult.SERVER_ERROR:
        return (
          <>
            <Typography level="title-lg">Error completing request.</Typography>
            <Typography level="body-md">Something isn't working right, please try again later.</Typography>
          </>
        )
    }
  }

  return (
    <Container maxWidth='sm' className={pageStyles.container}>
      <Card className={pageStyles.card}>
        <CardContent className={pageStyles["card-content"]}>
          {renderContent()}
        </CardContent>
      </Card>
    </Container>
  )
}