export default interface jobPostingDTO{
    title: string
    location: string | null
    work_type: string | null
    url: string
    created_at: string
    role_description: string
    low_pay_range: number | null
    high_pay_range: number | null
}