import { Link } from "react-router-dom";

type Props = {
  prompt: string;
  linkLabel: string;
  linkTo: string;
};

/** Shared footer under SignIn / SignUp — same layout on login and register */
export function AuthFormFooter({ prompt, linkLabel, linkTo }: Props) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link
        to={linkTo}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
