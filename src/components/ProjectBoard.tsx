import { PlusIcon } from '@heroicons/react/24/solid';
import TipTap from './TipTap';
import { useSyncedStore, useSyncedStores } from '@syncedstore/react';
import { emptyTask, globalStore, Project, Task } from '../store/store';
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Modal } from 'flowbite-react';
import { useState } from 'react';

import { BiX, BiPlus } from 'react-icons/bi';
import Toggle from './Toggle';

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
      <div className='flex flex-row items-center justify-between'>
        <h1 className='grow-0 m-4 py-0.5 px-4 text-3xl text-black font-bold bg-accent shadow-full_sm'>
          Task Board
        </h1>
        <div className='flex flex-row gap-4 m-4'>
          <Toggle />
        </div>
      </div>

      <div className='flex grow'>
        <div className='flex flex-row m-2 divide-x-2 divide-black'>
          {store.projects.map((project: Project, i: number) => (
            <ProjectItem key={i} project={project} />
          ))}
          <div className='flex flex-col h-full items-center justify-center p-2'>
            <button
              className='border-solid border-2 border-black rounded-full shadow-full_sm p-0.5 bg-accent hover:bg-accent-dark'
              onClick={() => addProject()}
            >
              <BiPlus className='h-8 w-8 text-black' />
            </button>
          </div>
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
    <div className='flex flex-col w-72 pr-2 pl-3 '>
      <div className='flex flex-row w-full mb-4 justify-between items-center gap-4 '>
        <input
          type='text'
          className='form-input appearance-none w-52 text-xl font-semibold font-sans text-black bg-transparent py-1 px-2 
              rounded-lg border-none caret-gray-900/50 focus:text-gray-900 focus:border-neutral-700 focus:outline-none'
          defaultValue={project.title}
          onChange={(e) => (project.title = e.target.value)}
        ></input>
        <button className='mb-1' onClick={() => removeProject()}>
          <BiX className='h-8 w-8 rounded-full text-black hover:bg-gray-900/30 hover:text-black focus:bg-red-700/25' />
        </button>
      </div>

      <div className='flex flex-col gap-4 items-center justify-center'>
        {project.tasks.map((task: any, j: number) => (
          <TaskItem
            key={j}
            projectIndex={store.projects.indexOf(project)}
            task={task}
          />
        ))}
        <button
          key={project.tasks.length}
          className='bg-secondary border-solid border-2 border-black rounded-full p-0.5 hover:bg-secondary-dark shadow-full_sm'
          onClick={() => addTask()}
        >
          <BiPlus className='h-5 w-5 text-black' />
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
    <div className='card flex flex-col divide-y-2 divide-black w-full gap-0 p-0 overflow-hidden'>
      <div className='flex flex-row justify-between items-center bg-primary pt-0.5'>
        <input
          type='text'
          className='form-input w-52 text-base font-semibold text-black bg-transparent py-0.5 px-1 mx-2 
              rounded-lg border-none outline-none focus:border-none focus:outline-none'
          defaultValue={task.title}
          onChange={(e) => (task.title = e.target.value)}
        ></input>
        <button className='mr-1' onClick={() => removeTask()}>
          <BiX className='h-7 w-7 rounded-full text-black hover:bg-primary-dark' />
        </button>
      </div>

      <div className='group flex flex-row justify-between items-center'>
        <TipTap task={task} className='min-h-[124px] w-full' />
        {/*<MyModal task={task} className='invisible group-hover:visible' />*/}
      </div>
    </div>
  );
};

const MyModal = (props: { className?: string; task: Task }) => {
  const [open, setOpen] = useState(false);
  const [task] = useSyncedStores([props.task, globalStore], [props.task]);

  const onClose = () => {
    setOpen(false);
  };

  const onOpen = () => {
    setOpen(true);
  };

  return (
    <div className={props.className}>
      <button onClick={onOpen} className=''>
        <ArrowsPointingOutIcon className='h-5 w-5 text-gray-900/30' />
      </button>
      <Modal show={open} onClose={onClose}>
        <Modal.Header>
          <input
            type='text'
            className='form-input appearance-none w-full text-xl font-semibold text-gray-900/75 bg-transparent py-1 px-2 
              rounded-lg border-none caret-gray-900/50 focus:text-gray-900 focus:border-neutral-700 focus:outline-none'
            defaultValue={task.title}
            onChange={(e) => (task.title = e.target.value)}
          ></input>
        </Modal.Header>
        <Modal.Body>
          <div className='space-y-6 p-2 border border-gray-200 rounded-md'>
            <TipTap task={task} className='h-96 w-full' />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProjectBoard;
