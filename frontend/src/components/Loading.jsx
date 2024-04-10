function Loading({text}) {
    return ( 
        <>
            <button className="d-flex align-items-center gap-1 btn btn-success mt-3 fs-4" type="button" disabled>
                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                {text}
            </button>
        </>
     );
}

export default Loading;