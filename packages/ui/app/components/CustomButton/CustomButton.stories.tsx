import type { Meta, StoryObj } from '@storybook/react';
import { CustomButton } from './CustomButton';

const meta: Meta<typeof CustomButton> = {
  title: 'UI/CustomButton',
  component: CustomButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CustomButton>;

export const Default: Story = {
  args: {
    children: 'CustomButton 컴포넌트',
  },
};
