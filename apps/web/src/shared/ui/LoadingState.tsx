import { Center, Loader } from '@mantine/core';

interface ILoadingStateProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingState({ size = 'md' }: ILoadingStateProps) {
  return (
    <Center py="xl">
      <Loader size={size} />
    </Center>
  );
}
