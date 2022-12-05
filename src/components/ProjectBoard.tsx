import { PlusIcon } from '@heroicons/react/24/solid';
import { Button } from 'flowbite-react';
import TipTap from './TipTap';
import { filterArray } from '@syncedstore/core';
import { useSyncedStore, useSyncedStores } from '@syncedstore/react';
import React, { useState } from 'react';
import Solid from './solid';
import { emptyTask, globalStore, Project, Task } from '../store';
import { TodoList } from './TodoList';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Props = {
  className?: string;
};

const ProjectBoard = (props: Props) => {
  const store = useSyncedStore(globalStore);

  const addProject = () => {
    store.projects.push({
      title: 'New Project',
      tasks: [emptyTask()],
    });
  };

  return (
    <div className={props.className}>
      <div className='flex flex-row m-2 divide-x divide-gray-900/20'>
        {store.projects.map((project: Project, i: number) => (
          <ProjectItem key={i} project={project} />
        ))}
        <div className='flex flex-col h-full items-center justify-center p-2'>
          <button
            className='border-solid border-2 border-gray-900/80 rounded-full p-1 shadow-lg hover:bg-gray-900/20'
            onClick={() => addProject()}
          >
            <PlusIcon className='h-8 w-8 text-gray-900/80' />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectItem = (props: { project: Project }) => {
  const [project, store] = useSyncedStores(
    [props.project, globalStore],
    [props.project]
  );

  const addTask = () => {
    project.tasks.push(emptyTask());
  };

  const removeProject = () => {
    const index = store.projects.indexOf(project);
    if (index > -1) {
      store.projects.splice(index, 1);
    }
  };

  return (
    <div className='flex flex-col w-72 px-2'>
      <div className='flex flex-row w-full mb-4 justify-between items-center gap-4'>
        <input
          type='text'
          className='form-input appearance-none w-52 text-xl font-semibold text-gray-900/75 bg-transparent py-1 px-2 
              rounded-lg border-none caret-gray-900/50 focus:text-gray-900 focus:border-neutral-700 focus:outline-none'
          defaultValue={project.title}
          onChange={(e) => (project.title = e.target.value)}
        ></input>
        <button className='mb-1' onClick={() => removeProject()}>
          <XMarkIcon className='h-6 w-6 rounded-full text-gray-900/30 hover:bg-gray-900/30 hover:text-black focus:bg-red-700/25' />
        </button>
      </div>
      <div className='flex flex-col gap-2 items-center justify-center'>
        {project.tasks.map((task: any, j: number) => (
          <TaskItem
            key={j}
            projectIndex={store.projects.indexOf(project)}
            task={task}
          />
        ))}
        <button
          key={project.tasks.length}
          className='border-solid border-2 border-gray-900/80 rounded-full p-1 shadow-lg hover:bg-gray-900/20'
          onClick={() => addTask()}
        >
          <PlusIcon className='h-6 w-6 text-gray-900/80' />
        </button>
      </div>
    </div>
  );
};

const TaskItem = (props: { projectIndex: number; task: Task }) => {
  const [task, store] = useSyncedStores(
    [props.task, globalStore],
    [props.task]
  );

  const project = store.projects[props.projectIndex];

  const removeTask = () => {
    const taskIndex = project.tasks.indexOf(task);
    if (taskIndex > -1) {
      project.tasks.splice(taskIndex, 1);
    }
  };

  return (
    <div className='flex flex-row gap-4 bg-white rounded-md p-2 shadow-xl'>
      <div className='flex flex-col divide-y divide-gray-300 w-full'>
        <div className='flex flex-row justify-between items-center'>
          <input
            type='text'
            className='form-input appearance-none w-52 text-base font-semibold text-gray-900/75 bg-transparent py-0.5 px-2 mb-1 
              rounded-lg border-none caret-gray-900/50 focus:text-gray-900 focus:border-neutral-700 focus:outline-none'
            defaultValue={task.title}
            onChange={(e) => (task.title = e.target.value)}
          ></input>
          <button className='mb-1' onClick={() => removeTask()}>
            <XMarkIcon className='h-6 w-6 rounded-full text-red-700/50 hover:bg-red-700/50 hover:text-white focus:bg-red-700/25' />
          </button>
        </div>

        <TipTap task={task} className='h-36 w-full block' />
      </div>
    </div>
  );
};

export default ProjectBoard;
