import { PlusIcon } from '@heroicons/react/24/solid';
import { Button } from 'flowbite-react';
import TipTap from './TipTap';
import { filterArray } from '@syncedstore/core';
import { useSyncedStore } from '@syncedstore/react';
import React, { useState } from 'react';
import Solid from './solid';
import { globalStore, Project, Task } from '../store';
import { TodoList } from './TodoList';

type Props = {
  className?: string;
};

const ProjectBoard = (props: Props) => {
  const store = useSyncedStore(globalStore);

  return (
    <div className={props.className}>
      <div className='flex flex-row m-2 divide-x divide-gray-900/20'>
        {store.projects.map((project, i) => (
          <ProjectItem key={project.title + i} project={project} />
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

const ProjectItem = (props: { project: Project }) => {
  return (
    <div className='flex flex-col w-72 px-2'>
      <div className='flex flex-row mb-4 justify-between items-center'>
        <h1 className='pt-1 text-xl font-semibold text-gray-900/75'>
          <input
            type='text'
            className='form-input w-fit text-xl text-gray-900/75 bg-transparent py-1 px-2 
              rounded-lg border-none focus:text-white focus:border-neutral-700 focus:outline-none focus:border'
            defaultValue={props.project.title}
            onChange={(e) => (props.project.title = e.target.value)}
          ></input>
        </h1>
        <button className='border-solid border-2 border-gray-900/80 rounded-full p-1 shadow-lg hover:bg-gray-900/20'>
          <PlusIcon className='h-6 w-6 text-gray-900/80' />
        </button>
      </div>
      <div className='flex flex-col gap-2'>
        {props.project.tasks.map((task: any, j: number) => (
          <TaskItem key={task.name + j} task={task} />
        ))}
      </div>
    </div>
  );
};

const TaskItem = (props: { task: Task }) => {
  return (
    <div className='flex flex-row gap-4 bg-white rounded-md p-2 shadow-xl'>
      <div className='flex flex-col divide-y divide-gray-300 w-full'>
        <div className='flex flex-row justify-between'>
          <h1 className='text-base text-gray-900'>{props.task.title}</h1>
        </div>

        <p className='text-sm text-gray-700 h-32'>
          {props.task.fragment.toJSON()}
        </p>
      </div>
    </div>
  );
};

export default ProjectBoard;
