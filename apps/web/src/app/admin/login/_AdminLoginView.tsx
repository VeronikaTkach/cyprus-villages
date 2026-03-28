'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { httpPost } from '@/shared/api/http-client';
import { useAuthStore } from '@/shared/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});

type TLoginValues = z.infer<typeof loginSchema>;

export function AdminLoginView() {
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<TLoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await httpPost('/auth/login', values);
      setAuthenticated(true);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  });

  return (
    <Center mih="100vh" bg="gray.0">
      <Card w={380} p="xl" radius="md" withBorder shadow="sm">
        <Stack gap="lg">
          <div>
            <Title order={3}>Cyprus Villages</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Admin login
            </Text>
          </div>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              {error}
            </Alert>
          )}

          <form onSubmit={onSubmit}>
            <Stack gap="md">
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Email"
                    placeholder="admin@example.com"
                    type="email"
                    required
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <PasswordInput
                    label="Password"
                    required
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <Button type="submit" loading={isSubmitting} mt="sm" fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Center>
  );
}
