import { component$ } from "@builder.io/qwik";
import styles from "./header.module.css";
import { ActionStore, Form } from "@builder.io/qwik-city";

type Props = {
  isConnected: boolean;
  handleLogout: ActionStore<{}, Record<string, any>, true>;
};

export default component$(({ isConnected, handleLogout }: Props) => {
  return (
    <header class={styles.header}>
      <div class={["container", styles.wrapper]}>
        <div class={styles.logo}>
          <a href="/" title="score santé">
            Score Santé
          </a>
        </div>
        <ul>
          {isConnected ? <>
            <li>
              <a href="/profile" >
                Profil
              </a>
            </li>
            <li>
              <Form action={handleLogout}>
                <div role="button">
                  Logout
                </div>
              </Form>
            </li>
          </> :
            <>
              <li>
                <a href="/auth/login" >
                  Login
                </a>
              </li>
              <li>
                <a href="/auth/register" >
                  Register
                </a>
              </li>
            </>
          }
        </ul>
      </div>
    </header>
  );
});
