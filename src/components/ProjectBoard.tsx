import { PlusIcon } from '@heroicons/react/24/solid';
import { Button } from 'flowbite-react';
import TipTap from './TipTap';
import { filterArray } from '@syncedstore/core';
import { useSyncedStore } from '@syncedstore/react';
import React, { useState } from 'react';
import Solid from './solid';
import { globalStore } from '../store';
import { TodoList } from './TodoList';

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
  {
    name: 'Sprint 2',
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

type Props = {
  className?: string;
};

const ProjectBoard = (props: Props) => {
  const store = useSyncedStore(globalStore);

  return (
    <div className={props.className}>
      <div className='flex flex-row m-2 divide-x divide-gray-900/20'>
        {projects.map((project, i) => (
          <Project key={project.name + i} project={project} />
        ))}
        <div className='flex flex-col h-full items-center justify-center p-2'>
          <button className='border-solid border-2 border-gray-900/80 rounded-full p-1 shadow-lg hover:bg-gray-900/20'>
            <PlusIcon className='h-8 w-8 text-gray-900/80' />
          </button>
        </div>
      </div>
    </div>
  );
};

const Project = ({ project }: any) => {
  return (
    <div className='flex flex-col w-72 px-2'>
      <div className='flex flex-row mb-4 justify-between items-center'>
        <h1 className='pt-1 text-xl font-semibold text-gray-900/75'>
          {project.name}
        </h1>
        <button className='border-solid border-2 border-gray-900/80 rounded-full p-1 shadow-lg hover:bg-gray-900/20'>
          <PlusIcon className='h-6 w-6 text-gray-900/80' />
        </button>
      </div>
      <div className='flex flex-col gap-2'>
        {project.tasks.map((task: any, j: number) => (
          <Task key={task.name + j} task={task} />
        ))}
      </div>
    </div>
  );
};

const Task = ({ task }: any) => {
  return (
    <div className='flex flex-row gap-4 bg-white rounded-md p-2 shadow-xl'>
      <div className='flex flex-col divide-y divide-gray-300 w-full'>
        <div className='flex flex-row justify-between'>
          <h1 className='text-base text-gray-900'>{task.name}</h1>
        </div>

        <p className='text-sm text-gray-700 h-32'>{task.description}</p>
      </div>
    </div>
  );
};

export default ProjectBoard;
