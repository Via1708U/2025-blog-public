'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { pushAbout, type AboutData } from './services/push-about'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import initialData from './list.json'

export default function Page() {
	const [data, setData] = useState<AboutData>(initialData as AboutData)
	const [originalData, setOriginalData] = useState<AboutData>(initialData as AboutData)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isPreviewMode, setIsPreviewMode] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const { content, loading } = useMarkdownRender(data.content)
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			await handleSave()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			handleSave()
		}
	}

	const handleEnterEditMode = () => {
		setIsEditMode(true)
		setIsPreviewMode(false)
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushAbout(data)

			setOriginalData(data)
			setIsEditMode(false)
			setIsPreviewMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setData(originalData)
		setIsEditMode(false)
		setIsPreviewMode(false)
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
				setIsPreviewMode(false)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handleChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12 max-sm:px-0'>
				<div className='w-full max-w-[800px]'>
					{isEditMode ? (
						isPreviewMode ? (
							<div className='space-y-6'>
								<div className='text-center'>
									<h1 className='mb-4 text-4xl font-bold'>{data.title || '标题预览'}</h1>
									<p className='text-secondary text-lg'>{data.description || '描述预览'}</p>
								</div>

								{loading ? (
									<div className='text-secondary text-center'>预览渲染中...</div>
								) : (
									<div className='card relative p-6'>
										<div className='prose prose-sm max-w-none [&_strong]:!text-[#4F8F9D] [&_strong]:!font-bold'>{content}</div>
									</div>
								)}
							</div>
						) : (
							<div className='space-y-6'>
								<div className='space-y-4'>
									<input
										type='text'
										placeholder='标题'
										className='w-full px-4 py-3 text-center text-2xl font-bold'
										value={data.title}
										onChange={e => setData({ ...data, title: e.target.value })}
									/>
									<input
										type='text'
										placeholder='描述'
										className='w-full px-4 py-3 text-center text-lg'
										value={data.description}
										onChange={e => setData({ ...data, description: e.target.value })}
									/>
								</div>

								<div className='card relative'>
									<textarea
										placeholder='Markdown 内容'
										className='min-h-[400px] w-full resize-none text-sm'
										value={data.content}
										onChange={e => setData({ ...data, content: e.target.value })}
									/>
								</div>
							</div>
						)
					) : (
						<>
							<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mb-12 text-center'>
								<h1 className='mb-4 text-4xl font-bold'>{data.title}</h1>
								<p className='text-secondary text-lg'>{data.description}</p>
							</motion.div>

							{loading ? (
								<div className='text-secondary text-center'>加载中...</div>
							) : (
								<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className='card relative p-6'>
									<div className='prose prose-sm max-w-none [&_strong]:!text-[#4F8F9D] [&_strong]:!font-bold'>{content}</div>
								</motion.div>
							)}
							<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className='mt-8 flex items-start justify-center gap-12'>

  {/* 查看完整简历 */}
  <div className='flex flex-col items-center gap-2'>
    <Link
      href='/resume'
      className='group flex h-[64px] w-[64px] items-center justify-center rounded-full border bg-white/70 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-md'>
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
        className='h-7 w-7 text-secondary transition-colors group-hover:text-[#4F8F9D]'>
        <path d='M6 3h9l3 3v15H6z' />
        <path d='M14 3v4h4' />
        <path d='M9 12h6' />
        <path d='M9 16h6' />
      </svg>
    </Link>

    <div className='text-center'>
      <div className='text-sm font-medium'>View Resume</div>
      <div className='text-secondary text-xs'>查看简历</div>
    </div>
  </div>

  {/* 下载 PDF */}
  <div className='flex flex-col items-center gap-2'>
    <a
      href='/resume.pdf'
      download
      className='group flex h-[64px] w-[64px] items-center justify-center rounded-full border bg-white/70 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-md'>
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
        className='h-7 w-7 text-secondary transition-colors group-hover:text-[#4F8F9D]'>
        <path d='M12 3v12' />
        <path d='m7 10 5 5 5-5' />
        <path d='M5 21h14' />
      </svg>
    </a>

    <div className='text-center'>
      <div className='text-sm font-medium'>Download PDF</div>
      <div className='text-secondary text-xs'>下载简历</div>
    </div>
  </div>
</motion.div>
						</>
					)}
				</div>
			</div>

			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='fixed top-4 right-6 z-10 flex gap-3 max-sm:hidden'>
				{isEditMode ? (
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsPreviewMode(prev => !prev)}
							disabled={isSaving}
							className={`rounded-xl border bg-white/60 px-6 py-2 text-sm`}>
							{isPreviewMode ? '继续编辑' : '预览'}
						</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '保存中...' : buttonText}
						</motion.button>
					</>
				) : (
					!hideEditButton && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleEnterEditMode}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
							编辑
						</motion.button>
					)
				)}
			</motion.div>
		</>
	)
}
