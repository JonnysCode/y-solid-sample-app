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
  return (
    <div className='flex flex-row h-full gap-4'>
      {projects.map((project, i) => (
        <div className='flex flex-col w-1/2 h-full' key={project.name + i}>
          <div className='flex flex-row justify-between items-center'>
            <h1 className='text-xl font-semibold text-primary-700'>
              {project.name}
            </h1>
            <button className='btn-primary'>Add Task</button>
          </div>
          <div className='flex flex-col gap-4'>
            {project.tasks.map((task, j) => (
              <div
                className='flex flex-row gap-4 bg-white rounded-md p-2 shadow-xl'
                key={task.name + j}
              >
                <div className='flex flex-col'>
                  <h1 className='text-xl font-semibold text-primary-700'>
                    {task.name}
                  </h1>
                  <p className='text-sm text-primary-700'>{task.description}</p>
                </div>
                <div className='flex flex-col'>
                  <h1 className='text-xl font-semibold text-primary-700'>
                    {task.status}
                  </h1>
                  <p className='text-sm text-primary-700'>{task.assignee}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className='flex flex-col w-1/2 h-full'></div>
    </div>
  );
};

export default ProjectBoard;
