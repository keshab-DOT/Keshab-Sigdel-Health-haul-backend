const errorHandle = (fn) => {
    return (req, res) => {
        fn(req, res)
            .catch((err) => {
                return res.status(500).json({ error: "Internal server error", errorMessage: err.message })

            })
    }
}

export default errorHandle;