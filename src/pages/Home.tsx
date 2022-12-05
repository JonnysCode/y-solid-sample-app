import ProjectBoard from '../components/ProjectBoard';

type Props = {};

const Home = (props: Props) => {
  return (
    <div className='flex flex-col h-screen'>
      <h1 className='grow-0 m-4 text-3xl font-semibold text-gray-900/75'>
        Task Board
      </h1>
      <ProjectBoard className='flex grow' />
    </div>
  );
};

export default Home;
