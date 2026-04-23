import { Container } from '@mantine/core';
import type { ContainerProps } from '@mantine/core';

interface IPageContainerProps extends ContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children, ...props }: IPageContainerProps) {
  return (
    <Container size="1120px" py={48} px={24} {...props}>
      {children}
    </Container>
  );
}
