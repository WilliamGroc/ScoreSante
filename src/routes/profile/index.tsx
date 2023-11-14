import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$, validator$, z, zod$ } from "@builder.io/qwik-city";
import { prisma } from "~/services/prisma.service";
import bcrypt from 'bcrypt';

export const useProfileLoader = routeLoader$(async ({ cookie, redirect }) => {
  const userCookie = cookie.get('user')?.json() as any;

  if (!userCookie) {
    redirect(301, '/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userCookie.id,
    },
    select: {
      name: true,
      email: true,
    },
  });

  return {
    user
  };
});

export const useProfileUpdateAction = routeAction$(async (data, { cookie }) => {
  const userCookie = cookie.get('user')?.json() as any;
  await prisma.user.update({
    where: {
      id: userCookie.id,
    },
    data: {
      name: data.name,
      password: data.password ? bcrypt.hashSync(data.password, 10) : undefined,
    }
  });

  return {
    success: true
  };
},
  zod$(z.object({
    name: z.string(),
    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
  })),
  validator$(async (_, data: any) => {
    if (data.password && data.password !== data.passwordConfirmation) {
      return {
        success: false,
        error: {
          passwordConfirmation: 'Passwords do not match'
        }
      };
    }

    return {
      success: true,
      data
    }
  }));

export default component$(() => {
  const profileUpdateAction = useProfileUpdateAction();
  const profileLoader = useProfileLoader();


  return (
    <div class="container">
      <h1>Profile</h1>
      {profileUpdateAction.value?.success && (
        <div class="alert success">
          Profile updated successfully
        </div>
      )
      }
      <Form action={profileUpdateAction}>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="name">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={profileUpdateAction.formData?.get('name') || profileLoader.value?.user?.name}
              />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="text"
                name="email"
                disabled
                value={profileLoader.value?.user?.email}
              />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" name="password" id="password" />
            </div>
            <div class="form-group">
              <label for="password_confirmation">Password Confirmation</label>
              <input type="password" name="passwordConfirmation" id="passwordConfirmation" />
            </div>
            <div class="form-group">
              <button type="submit">Submit</button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  )
});