"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useAdminAuth } from "@/lib/admin-auth"

export default function NewContentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { adminUser, isAuthenticated, loading } = useAdminAuth()
  const [contentType, setContentType] = useState<"blog" | "portfolio">("blog")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // 블로그 포스트 상태
  const [blogPost, setBlogPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    categoryId: "programming",
    tags: "",
    published: true,
  })

  // 포트폴리오 프로젝트 상태
  const [portfolioProject, setPortfolioProject] = useState({
    title: "",
    description: "",
    tags: "",
    featured: false,
    projectUrl: "",
    githubUrl: "",
  })

  // 인증 확인
  if (!loading && !isAuthenticated) {
    router.push("/admin/login")
    return null
  }

  // 이미지 업로드 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  // 블로그 포스트 필드 변경 처리
  const handleBlogChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBlogPost((prev) => ({ ...prev, [name]: value }))
  }

  // 포트폴리오 프로젝트 필드 변경 처리
  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPortfolioProject((prev) => ({ ...prev, [name]: value }))
  }

  // 블로그 공개 상태 변경 처리
  const handleBlogPublishedChange = (checked: boolean) => {
    setBlogPost((prev) => ({ ...prev, published: checked }))
  }

  // 포트폴리오 주요 프로젝트 상태 변경 처리
  const handlePortfolioFeaturedChange = (checked: boolean) => {
    setPortfolioProject((prev) => ({ ...prev, featured: checked }))
  }

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 실제 구현에서는 API 호출로 데이터 저장
      // 데모 목적으로 성공 메시지만 표시
      setTimeout(() => {
        toast({
          title: contentType === "blog" ? "블로그 포스트 생성 완료" : "포트폴리오 프로젝트 생성 완료",
          description:
            contentType === "blog"
              ? "새 블로그 포스트가 성공적으로 생성되었습니다."
              : "새 포트폴리오 프로젝트가 성공적으로 생성되었습니다.",
        })
        router.push("/admin")
      }, 1000)
    } catch (error) {
      console.error("Failed to create content:", error)
      toast({
        title: "생성 실패",
        description: "콘텐츠를 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">새 콘텐츠 생성</h1>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <Button
            variant={contentType === "blog" ? "default" : "outline"}
            onClick={() => setContentType("blog")}
            className={contentType === "blog" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
          >
            블로그 포스트
          </Button>
          <Button
            variant={contentType === "portfolio" ? "default" : "outline"}
            onClick={() => setContentType("portfolio")}
            className={contentType === "portfolio" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
          >
            포트폴리오 프로젝트
          </Button>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{contentType === "blog" ? "블로그 포스트 정보" : "포트폴리오 프로젝트 정보"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 블로그 포스트 폼 */}
            {contentType === "blog" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    name="title"
                    value={blogPost.title}
                    onChange={handleBlogChange}
                    required
                    placeholder="포스트 제목을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={blogPost.content}
                    onChange={handleBlogChange}
                    required
                    placeholder="포스트 내용을 입력하세요"
                    rows={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">요약</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={blogPost.excerpt}
                    onChange={handleBlogChange}
                    placeholder="포스트 요약을 입력하세요 (비워두면 자동 생성됩니다)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">카테고리</Label>
                  <Input
                    id="categoryId"
                    name="categoryId"
                    value={blogPost.categoryId}
                    onChange={handleBlogChange}
                    placeholder="카테고리 ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">태그</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={blogPost.tags}
                    onChange={handleBlogChange}
                    placeholder="태그를 쉼표로 구분하여 입력하세요 (예: React, TypeScript, 튜토리얼)"
                  />
                  <p className="text-sm text-muted-foreground">쉼표로 구분하여 여러 태그를 입력할 수 있습니다.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="published" checked={blogPost.published} onCheckedChange={handleBlogPublishedChange} />
                  <Label htmlFor="published">즉시 공개</Label>
                </div>
              </>
            )}

            {/* 포트폴리오 프로젝트 폼 */}
            {contentType === "portfolio" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    name="title"
                    value={portfolioProject.title}
                    onChange={handlePortfolioChange}
                    required
                    placeholder="프로젝트 제목을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={portfolioProject.description}
                    onChange={handlePortfolioChange}
                    required
                    placeholder="프로젝트에 대한 설명을 입력하세요"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">태그</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={portfolioProject.tags}
                    onChange={handlePortfolioChange}
                    placeholder="태그를 쉼표로 구분하여 입력하세요 (예: React, TypeScript, UI/UX)"
                  />
                  <p className="text-sm text-muted-foreground">쉼표로 구분하여 여러 태그를 입력할 수 있습니다.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectUrl">프로젝트 URL</Label>
                  <Input
                    id="projectUrl"
                    name="projectUrl"
                    type="url"
                    value={portfolioProject.projectUrl}
                    onChange={handlePortfolioChange}
                    placeholder="https://your-project.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    value={portfolioProject.githubUrl}
                    onChange={handlePortfolioChange}
                    placeholder="https://github.com/username/project"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={portfolioProject.featured}
                    onCheckedChange={handlePortfolioFeaturedChange}
                  />
                  <Label htmlFor="featured">주요 프로젝트로 표시</Label>
                </div>
              </>
            )}

            {/* 이미지 업로드 (공통) */}
            <div className="space-y-2">
              <Label htmlFor="image">{contentType === "blog" ? "커버 이미지" : "프로젝트 이미지"}</Label>
              {imagePreview ? (
                <div className="relative mt-2 rounded-md overflow-hidden">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-64 w-auto" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <Label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-primary/5"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF (최대 10MB)</p>
                    </div>
                    <Input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </Label>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin">취소</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : contentType === "blog" ? "포스트 저장" : "프로젝트 저장"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

