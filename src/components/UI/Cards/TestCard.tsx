type TestCardProps = {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
};

function TestCard(props: TestCardProps) {
  const {
    title,
    description,
    buttonText = "Click me",
    onButtonClick,
  } = props;

  return (
    <div className="container mt-4">
      <div className="card shadow mb-4">
        {/* Header */}
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">{title}</h6>
        </div>

        {/* Body */}
        <div className="card-body">
          <p className="text-gray-800">{description}</p>

          {onButtonClick && (
            <button
              className="btn btn-primary"
              onClick={onButtonClick}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestCard;