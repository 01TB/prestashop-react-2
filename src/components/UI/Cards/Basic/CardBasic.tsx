import type { ReactNode } from "react";

interface CardBasicProps {
  title?: string;
  children: ReactNode;
}

function CardBasic({ title, children }: CardBasicProps) {

    return (
        <div className="card shadow mb-4">
        <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">{title}</h6>
        </div>
        <div className="card-body">
            {children}
        </div>
        </div>
    );
}

export default CardBasic;