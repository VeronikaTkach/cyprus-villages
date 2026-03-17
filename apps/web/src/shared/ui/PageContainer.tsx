import { Container } from '@mantine/core';
import type { ContainerProps } from '@mantine/core';

interface IPageContainerProps extends ContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children, ...props }: IPageContainerProps) {
  return (
    <Container size="lg" py="xl" {...props}>
      {children}
    </Container>
  );
}
