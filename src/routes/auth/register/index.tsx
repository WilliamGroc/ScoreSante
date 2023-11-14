import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$, z, Form, validator$ } from "@builder.io/qwik-city";
import { prisma } from "~/services/prisma.service";
import bcrypt from 'bcrypt';

export const useCreateUser = routeAction$(
  async (data, { fail, redirect }) => {
    try {
      const hashedPassword = bcrypt.hashSync(data.password, 10);

      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });

      redirect(301, '/auth/login');
    } catch (e) {
      console.log(e)
      return fail(500, {
        message: 'Failed to create user'
      });
    }
  },
  zod$(z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    passwordConfirmation: z.string(),
  })),
  validator$(async (ev, data: any) => {
    if (data.password !== data.passwordConfirmation) {
      return {
        success: false,
        error: {
          passwordConfirmation: 'Passwords do not match'
        }
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: {
          email: 'Email already exists'
        }
      };
    }

    return {
      success: true,
      data
    }
  })
);

export default component$(() => {
  const createUserAction = useCreateUser();

  console.log(createUserAction.value)

  return (
    <section class="container">
      <h1>Create User</h1>
      <Form action={createUserAction}>
        <div class="form-group">
          <label>
            Name
          </label>
          <input name="name" value={createUserAction.formData?.get("name")} />
        </div>
        <div class="form-group">
          <label>
            Email
          </label>
          <input name="email" value={createUserAction.formData?.get("email")} />
          <div class="error">
            {createUserAction.value?.failed && createUserAction.value?.email}
          </div>
        </div>
        <div class="form-group">
          <label>
            Password
          </label>
          <input
            type="password"
            name="password"
            value={createUserAction.formData?.get("password")}
          />
        </div>
        <div class="form-group">
          <label>
            Password confirmation
          </label>
          <input
            type="password"
            name="passwordConfirmation"
            value={createUserAction.formData?.get("passwordConfirmation")}
          />
          <div class="error">
            {createUserAction.value?.failed && createUserAction.value?.passwordConfirmation}
          </div>
        </div>
        <button type="submit">Create</button>
      </Form>
      {
        createUserAction.value && (
          <div>
            <h2>{createUserAction.value?.message}</h2>
          </div>
        )
      }
    </section >
  );
});
