import React from 'react';

const projects = [
  {
    name: 'Sprint 1',
    description:
      'A simple, fast, and flexible state management library for React.',
    tasks: [
      {
        name: 'Add support for nested stores',
        description: 'Add support for nested stores',
        status: 'in-progress',
        assignee: 'joshua',
      },
      {
        name: 'Add support for nested stores',
        description: 'Add support for nested stores',
        status: 'in-progress',
        assignee: 'joshua',
      },
    ],
  },
];

type Props = {};

const ProjectBoard = (props: Props) => {
  return <div className='flex flex-row h-full'></div>;
};

export default ProjectBoard;
