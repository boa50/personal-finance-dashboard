const BaseChart = ({ title, children }: { title: string, children: React.ReactNode }) => {
    return (
        <div>
            <h2 className='ml-4'>{title}</h2>
            {children}
        </div>
    )
}

export default BaseChart