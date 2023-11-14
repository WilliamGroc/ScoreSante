import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { prisma } from "~/services/prisma.service";
import bcrypt from 'bcrypt';

export const useLoginAction = routeAction$(async (params, { fail, redirect, cookie }) => {
  const user = await prisma.user.findUnique({
    where: {
      email: params.email,
    },
  });

  if (!user) {
    return fail(404, {
      message: 'User not found'
    });
  }

  if (!bcrypt.compareSync(params.password, user.password)) {
    return fail(401, {
      message: 'Invalid password'
    });
  }

  cookie.set('user', {
    id: user.id,
  }, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'strict',
    path: '/',
  });

  redirect(301, '/');
},
  zod$({
    email: z.string().email(),
    password: z.string(),
  }))

export default component$(() => {
  const loginAction = useLoginAction();

  console.log(
    loginAction.value,
  )
  return <section class="container">
    <h1>Login</h1>
    {loginAction.value?.failed && (
      <div>
        <h2>Failed to login</h2>
        <div>{loginAction.value?.formErrors}</div>
      </div>
    )}
    <Form action={loginAction}>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>Email</label>
            <input type="text" class="form-control" name="email" value={loginAction.formData?.get("email")} />
            <div class="error">
              {loginAction.value?.fieldErrors?.email}
            </div>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" name="password" />
            <div class="error">
              {loginAction.value?.fieldErrors?.password}
            </div>
          </div>
          <button type="submit">Login</button>
        </div>
      </div>
    </Form>
  </section>
});